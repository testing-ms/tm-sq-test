function getUrlLogo(empresa: string, nombreArchivo: string) {
  const bucketName = 'almamedica-assets';
  return `https://storage.googleapis.com/${bucketName}/Empresas/${empresa}/${nombreArchivo}`;
}

export default getUrlLogo;
