import FormField from '../Form/FormField/FormField'
import { Formik } from 'formik'
import { Button } from '../ui/button'
import * as Yup from 'yup';


export default function LoginForm() {

  return (
    <Formik
    initialValues={{
      username: '',
      password: '',
    }}
    onSubmit={() => {}}
    validationSchema={Yup.object().shape({
      username: Yup.string().required('El nombre de usuario es requerido'),
      password: Yup.string().required('La contraseña es requerida'),
    })}
  >
    {({ handleSubmit, errors }) => (
      <form className="space-y-6 w-3/4" onSubmit={handleSubmit}>
        <FormField
          id='username'
          type="text"
          placeholder="Nombre de usuario"
          name='username'
          label='Nombre de usuario'
        />
        {errors.username && <p className='text-red-500 text-xs mb-2'>{errors.username}</p>}
        <FormField
          id='password'
          type="password"
          placeholder="Contraseña"
          name='password'
          label='Contraseña'
        />
        {errors.password && <p className='text-red-500 text-xs mb-2'>{errors.password}</p>}
        <Button type="submit" className='w-full'>Iniciar sesión</Button>
      </form>
    )}
  </Formik>
  )
}
