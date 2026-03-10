// hooks/useForm.js
// Hook para manejo de estado y validación del formulario de reporte

import { useState } from 'react';

const CAMPOS_REQUERIDOS = ['fecha', 'hora', 'placa', 'componente', 'descripcion', 'responsable'];

const ESTADO_INICIAL = {
  fecha: new Date().toLocaleDateString('es-CO'),
  hora: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
  poblacion: '',
  numeroBuseta: '',
  placa: '',
  fotoUri: null,
  linkFoto: '',
  componente: '',
  descripcion: '',
  preliminar: false,
  responsable: '',
  observaciones: '',
};

export function useForm() {
  const [campos, setCampos] = useState(ESTADO_INICIAL);
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);

  // Actualiza un campo individual
  const setcampo = (nombre, valor) => {
    setCampos((prev) => ({ ...prev, [nombre]: valor }));
    // Limpiar error al escribir
    if (errores[nombre]) {
      setErrores((prev) => ({ ...prev, [nombre]: null }));
    }
  };

  // Valida todos los campos requeridos
  const validar = () => {
    const nuevosErrores = {};

    CAMPOS_REQUERIDOS.forEach((campo) => {
      const valor = campos[campo];
      if (!valor || (typeof valor === 'string' && !valor.trim())) {
        nuevosErrores[campo] = 'Este campo es obligatorio';
      }
    });

    if (campos.placa && !/^[A-Z]{3}[0-9]{3}$|^[A-Z]{3}[0-9]{2}[A-Z]$/.test(campos.placa)) {
      nuevosErrores.placa = 'Formato inválido (ej: ABC123 o ABC12D)';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Resetea el formulario al estado inicial
  const resetear = () => {
    setCampos({
      ...ESTADO_INICIAL,
      fecha: new Date().toLocaleDateString('es-CO'),
      hora: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    });
    setErrores({});
  };

  return {
    campos,
    errores,
    enviando,
    setEnviando,
    setcampo,
    validar,
    resetear,
  };
}
