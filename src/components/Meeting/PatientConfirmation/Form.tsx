import { useFormik } from "formik"
import { X, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PatientData } from './patientConfirmation'
import { patientSchema } from './FormSchema'

interface PatientFormProps {
  onConfirm: (values: PatientData) => void
  onClose: () => void
  initialData?: PatientData
  isLoading?: boolean
}

export function PatientForm({ onConfirm, onClose, initialData, isLoading }: PatientFormProps) {
  const formik = useFormik({
    initialValues: initialData || {
      nombres: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      email: "",
      numeroContacto: "",
    },
    validationSchema: patientSchema,
    onSubmit: (values) => {
      onConfirm(values)
    },
  })

  return (
    <Card className="w-full max-w-xl border shadow-md">
      <CardHeader className="space-y-1 p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-medium text-primary">
            {isLoading ? "Cargando datos..." : "Confirmar Datos Paciente"}
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Separator className="mt-2" />
      </CardHeader>
      {isLoading ? (
        <div className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <form onSubmit={formik.handleSubmit}>
          <CardContent className="grid gap-4 p-4">
            <div className="space-y-1">
              <Label htmlFor="nombres" className="text-sm">Nombres</Label>
              <Input
                id="nombres"
                {...formik.getFieldProps("nombres")}
                className={`h-9 ${formik.touched.nombres && formik.errors.nombres ? "border-destructive" : ""}`}
                placeholder="Ingrese sus nombres"
              />
              {formik.touched.nombres && formik.errors.nombres && (
                <p className="text-xs text-destructive">{formik.errors.nombres}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="apellidoPaterno" className="text-sm">Apellido Paterno</Label>
                <Input
                  id="apellidoPaterno"
                  {...formik.getFieldProps("apellidoPaterno")}
                  className={`h-9 ${formik.touched.apellidoPaterno && formik.errors.apellidoPaterno ? "border-destructive" : ""}`}
                  placeholder="Ingrese apellido paterno"
                />
                {formik.touched.apellidoPaterno && formik.errors.apellidoPaterno && (
                  <p className="text-xs text-destructive">{formik.errors.apellidoPaterno}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="apellidoMaterno" className="text-sm">Apellido Materno</Label>
                <Input
                  id="apellidoMaterno"
                  {...formik.getFieldProps("apellidoMaterno")}
                  className={`h-9 ${formik.touched.apellidoMaterno && formik.errors.apellidoMaterno ? "border-destructive" : ""}`}
                  placeholder="Ingrese apellido materno"
                />
                {formik.touched.apellidoMaterno && formik.errors.apellidoMaterno && (
                  <p className="text-xs text-destructive">{formik.errors.apellidoMaterno}</p>
                )}
              </div>
            </div>

            <Separator className="my-1" />

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...formik.getFieldProps("email")}
                  className={`h-9 ${formik.touched.email && formik.errors.email ? "border-destructive" : ""}`}
                  placeholder="correo@ejemplo.com"
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="text-xs text-destructive">{formik.errors.email}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="numeroContacto" className="text-sm">N° Contacto</Label>
                <Input
                  id="numeroContacto"
                  {...formik.getFieldProps("numeroContacto")}
                  className={`h-9 ${formik.touched.numeroContacto && formik.errors.numeroContacto ? "border-destructive" : ""}`}
                  placeholder="+56 9 XXXX XXXX"
                />
                {formik.touched.numeroContacto && formik.errors.numeroContacto && (
                  <p className="text-xs text-destructive">{formik.errors.numeroContacto}</p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 p-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              size="sm"
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm">
              Confirmar
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  )
}