import * as yup from "yup"

export const patientSchema = yup.object().shape({
  nombres: yup.string().required("El nombre es requerido"),
  apellidoPaterno: yup.string().required("El apellido paterno es requerido"),
  apellidoMaterno: yup.string().required("El apellido materno es requerido"),
  email: yup.string().email("Email inválido").required("El email es requerido"),
  numeroContacto: yup
    .string()
    .min(9, "Mínimo 9 dígitos")
    .max(12, "Máximo 12 dígitos")
    .required("El número de contacto es requerido"),
})
