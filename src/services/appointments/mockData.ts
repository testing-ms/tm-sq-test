export const testData = {
  patientEmail: "juampimg@gmail.com",
  patientName: "Juan Pérez",
  patientData: {
    name: "Juan Pérez",
    rut: "12.345.678-9",
    sex: "Masculino",
    birthDate: "1980-01-01",
    age: "43",
    commune: "La Florida",
    address: "Av. Principal 123"
  },
  appointmentData: {
    prevision: "FONASA",
    attentionType: "Teleconsulta",
    provider: "Dra. María González",
    providerRut: "9.876.543-2",
    date: "2024-03-15"
  },
  clinicalData: {
    motives: "Dolor de cabeza y mareos",
    remoteAnamnesis: "Hipertensión arterial en tratamiento",
    proximateAnamnesis: "Dolor de cabeza desde hace 3 días",
    physicalExam: {
      weight: "75",
      height: "170",
      imc: "25.9",
      heartRate: "72",
      waistCircumference: "92",
      bloodPressure: "130/85",
      temperature: "36.5",
      segmentaryExam: "Sin hallazgos relevantes"
    }
  },
  prescriptionData: {
    diagnosis: "Cefalea tensional",
    medications: ""
  },
  examData: {
    diagnosis: "Cefalea en estudio",
    examRequests: [
      "Hemograma completo",
      "TAC de cerebro sin contraste"
    ]
  },
  indicationsData: {
    diagnosis: "Cefalea tensional",
    indications: ""
  }
};