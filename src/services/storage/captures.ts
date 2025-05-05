// import { Storage } from '@google-cloud/storage';
// import html2canvas from 'html2canvas';

// export class CaptureService {
//   private storage: Storage;
//   private bucketName = 'telemedicina-captures'; // Nombre de tu bucket

//   constructor() {
//     const projectId = import.meta.env.VITE_GOOGLE_CLOUD_PROJECT_ID;
//     const clientEmail = import.meta.env.VITE_GOOGLE_CLOUD_CLIENT_EMAIL;
//     const privateKey = import.meta.env.VITE_GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n');

//     if (!projectId || !clientEmail || !privateKey) {
//       throw new Error('Faltan credenciales de Google Cloud Storage');
//     }

//     this.storage = new Storage({
//       projectId,
//       credentials: {
//         client_email: clientEmail,
//         private_key: privateKey
//       }
//     });

//     // Verificar que podemos acceder al bucket
//     this.storage.bucket(this.bucketName).exists()
//       .then(([exists]) => {
//         if (!exists) {
//           console.error('[Capture] El bucket no existe:', this.bucketName);
//         } else {
//           console.log('[Capture] Conexión con GCS establecida correctamente');
//         }
//       })
//       .catch(error => {
//         console.error('[Capture] Error al verificar bucket:', error);
//       });
//   }

//   private async captureScreen(): Promise<string> {
//     try {
//       const canvas = await html2canvas(document.body, {
//         useCORS: true,
//         allowTaint: true,
//         logging: false,
//         width: window.innerWidth,
//         height: window.innerHeight,

//         // Capturar el contenido completo, incluyendo el picture-in-picture
//         // onclone: (clonedDoc) => {
//         //   const videos = clonedDoc.getElementsByTagName('video');
//         //   for (const video of videos) {
//         //     if (video.classList.contains('pip-video')) {
//         //       // Asegurarse de que el video PiP se capture
//         //       video.style.zIndex = '9999';
//         //     }
//         //   }
//         // }
//       });

//       return canvas.toDataURL('image/png');
//     } catch (error) {
//       console.error('[Capture] Error al capturar pantalla:', error);
//       throw new Error('No se pudo capturar la pantalla');
//     }
//   }

//   private getFilePath(professionalId: number, appointmentId: number): string {
//     const now = new Date();
//     const year = now.getFullYear();
//     const month = String(now.getMonth() + 1).padStart(2, '0');
//     const timestamp = now.toISOString().replace(/[:.]/g, '-');

//     return `professional_${professionalId}/${year}/${month}/appointment_${appointmentId}/capture_${timestamp}.png`;
//   }

//   async captureAndStore(professionalId: number, appointmentId: number): Promise<string> {
//     try {
//       console.log('[Capture] Iniciando captura de pantalla');
//       const imageData = await this.captureScreen();

//       // Convertir base64 a buffer
//       const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
//       const imageBuffer = Buffer.from(base64Data, 'base64');

//       // Generar ruta del archivo
//       const filePath = this.getFilePath(professionalId, appointmentId);
//       console.log('[Capture] Guardando en:', filePath);

//       // Subir a GCS
//       const bucket = this.storage.bucket(this.bucketName);
//       const file = bucket.file(filePath);

//       await file.save(imageBuffer, {
//         metadata: {
//           contentType: 'image/png',
//           metadata: {
//             appointmentId: appointmentId.toString(),
//             professionalId: professionalId.toString(),
//             captureTime: new Date().toISOString()
//           }
//         }
//       });

//       // Obtener URL pública (con expiración de 1 hora)
//       const [url] = await file.getSignedUrl({
//         action: 'read',
//         expires: Date.now() + 60 * 60 * 1000 // 1 hora
//       });

//       console.log('[Capture] Captura almacenada exitosamente');
//       return url;

//     } catch (error) {
//       console.error('[Capture] Error en el proceso de captura y almacenamiento:', error);
//       throw error;
//     }
//   }
// }