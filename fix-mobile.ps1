# fix-mobile.ps1
# Inyecta CSS de viewport fijo en todos los HTML del build para eliminar espacio blanco en Android

$CSS_FIX = @"
<style id="mobile-viewport-fix">
*, *::before, *::after { box-sizing: border-box; }
html {
  height: 100%; height: -webkit-fill-available;
  margin: 0; padding: 0;
  overflow: hidden;
}
body {
  height: 100%; height: 100dvh;
  min-height: -webkit-fill-available;
  margin: 0; padding: 0;
  overflow: hidden;
  overscroll-behavior: none;
  overscroll-behavior-y: none;
  -webkit-overflow-scrolling: touch;
  background-color: #09090B;
  position: fixed;
  width: 100%; max-width: 100%;
  top: 0; left: 0;
  touch-action: pan-y;
}
#root {
  display: flex;
  height: 100%; height: 100dvh;
  width: 100%; max-width: 100%;
  overflow: hidden;
  position: fixed;
  top: 0; left: 0;
}
</style>
"@

$htmlFiles = Get-ChildItem -Path "docs" -Filter "*.html" -Recurse

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    
    # Solo inyectar si aun no está el fix
    if ($content -notmatch "mobile-viewport-fix") {
        # Inyectar ANTES de </head> o antes de </style> del expo-reset
        $patternOld = '<style id="expo-reset">#root,body,html\{height:100%\}body\{overflow:hidden\}#root\{display:flex\}</style>'
        $patternNew = '<style id="expo-reset">#root,body,html{height:100%}body{overflow:hidden}#root{display:flex}</style>' + $CSS_FIX
        
        if ($content -match [regex]::Escape('<style id="expo-reset">#root,body,html{height:100%}body{overflow:hidden}#root{display:flex}</style>')) {
            $content = $content -replace [regex]::Escape('<style id="expo-reset">#root,body,html{height:100%}body{overflow:hidden}#root{display:flex}</style>'), ('<style id="expo-reset">#root,body,html{height:100%}body{overflow:hidden}#root{display:flex}</style>' + $CSS_FIX.Trim())
        } else {
            # Fallback: insertar antes de </head>
            $content = $content -replace '</head>', ($CSS_FIX.Trim() + '</head>')
        }
        
        # Tambien arreglar el viewport meta si no tiene maximum-scale
        $content = $content -replace 'content="width=device-width, initial-scale=1, shrink-to-fit=no"', 'content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, shrink-to-fit=no, viewport-fit=cover"'
        
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
        Write-Host "Fix aplicado: $($file.Name)"
    } else {
        Write-Host "Ya tiene fix: $($file.Name)"
    }
}

Write-Host "`nFix de viewport movil aplicado a todos los HTML en docs/"
