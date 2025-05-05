import { Shield } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-tertiary/5">
            <Shield className="h-5 w-5 text-tertiary" />
          </div>
          <div>
            <h1 className="text-2xl font-medium text-gray-900">Política de Privacidad</h1>
            <p className="text-sm text-gray-500">Uso de datos y permisos de Google Calendar</p>
            <p className="text-xs text-gray-400">Última actualización: 8 abril 2024</p>
          </div>
        </div>
      </div>

      <div className="prose prose-gray max-w-none">
        <section className="mb-8">
          <h2 className="text-xl font-medium mb-4">Uso de Google Calendar</h2>
          <p>
            Nuestra aplicación de telemedicina utiliza Google Calendar para gestionar las citas médicas de manera eficiente.
            Para proporcionar este servicio, necesitamos ciertos permisos de acceso a tu cuenta de Google Calendar.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-medium mb-4">Permisos Solicitados</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Permisos Básicos</h3>
              <ul className="list-disc pl-6 mt-2">
                <li>Ver tu dirección de correo electrónico principal</li>
                <li>Ver tu información personal básica</li>
                <li>Asociar la aplicación con tu información en Google</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium">Permisos de Calendario</h3>
              <ul className="list-disc pl-6 mt-2">
                <li>Crear calendarios secundarios</li>
                <li>Consultar, crear, modificar y borrar eventos</li>
                <li>Ver la lista de calendarios suscritos</li>
                <li>Consultar la disponibilidad en los calendarios</li>
                <li>Ver eventos de calendarios públicos</li>
                <li>Consultar la configuración de tu calendario</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-medium mb-4">Cómo Usamos estos Permisos</h2>
          <ul className="list-disc pl-6">
            <li>Creamos y gestionamos calendarios específicos para citas médicas</li>
            <li>Programamos y actualizamos citas con los profesionales de salud</li>
            <li>Verificamos la disponibilidad para nuevas citas</li>
            <li>Sincronizamos eventos relacionados con la telemedicina</li>
            <li>Enviamos recordatorios de citas</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-medium mb-4">Protección de Datos</h2>
          <p>
            Implementamos rigurosas medidas de seguridad para proteger tus datos:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Utilizamos cifrado de extremo a extremo para proteger toda la información transmitida</li>
            <li>Mantenemos servidores seguros con certificaciones SSL/TLS actualizadas</li>
            <li>Seguimos las mejores prácticas de la industria para el almacenamiento seguro de datos</li>
            <li>Restringimos el acceso a datos sensibles solo a personal autorizado</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-medium mb-4">Retención y Eliminación de Datos</h2>
          <p>
            Gestionamos tus datos con los siguientes principios:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Conservaremos tu información personal durante el tiempo necesario para cumplir con los propósitos descritos en esta política de privacidad, a menos que la ley exija o permita un período de retención más largo</li>
            <li>Los datos de calendario se mantienen activos mientras tu cuenta esté activa</li>
            <li>Puedes solicitar la eliminación de tus datos en cualquier momento a través de nuestro portal de soporte o enviando un correo a gestion_ti@maiposalud.cl</li>
            <li>Tras la solicitud de eliminación, tus datos serán completamente eliminados de nuestros sistemas en un plazo máximo de 30 días</li>
            <li>Mantenemos copias de seguridad encriptadas por un período adicional de 90 días por motivos de recuperación ante desastres</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-medium mb-4">Revocación de Permisos</h2>
          <p>
            Puedes revocar estos permisos en cualquier momento:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Desde la configuración de tu cuenta de Google</li>
            <li>A través de nuestro portal de usuario en la sección de configuración</li>
            <li>Contactando a nuestro equipo de soporte</li>
          </ul>
          <p className="mt-4">
            Ten en cuenta que la revocación de permisos afectará la funcionalidad de la aplicación relacionada con la gestión de citas.
            Tras la revocación, tus datos serán eliminados según nuestra política de retención y eliminación de datos.
          </p>
        </section>
      </div>
    </div>
  );
}