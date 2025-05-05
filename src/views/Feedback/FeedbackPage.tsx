import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { AppointmentsService } from '@/services/appointments/queries';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface FeedbackData {
  appointmentId: string;
  rating: number;
  professionalAttention: 'excellent' | 'good' | 'fair' | 'poor';
  communicationClarity: 'excellent' | 'good' | 'fair' | 'poor';
  consultationSatisfaction: 'very_satisfied' | 'satisfied' | 'unsatisfied' | 'very_unsatisfied';
  platformExperience: 'excellent' | 'good' | 'fair' | 'poor';
  comment: string;
  wouldRecommend: boolean;
}

export default function FeedbackPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState<number>(0);
  const [professionalAttention, setProfessionalAttention] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');
  const [communicationClarity, setCommunicationClarity] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');
  const [consultationSatisfaction, setConsultationSatisfaction] = useState<'very_satisfied' | 'satisfied' | 'unsatisfied' | 'very_unsatisfied'>('satisfied');
  const [platformExperience, setPlatformExperience] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');
  const [comment, setComment] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);

  const { mutate: submitFeedback, isPending } = useMutation({
    mutationFn: (data: FeedbackData) => AppointmentsService.submitFeedback(data),
    onSuccess: () => {
      toast.success('¡Gracias por tu feedback!');
      navigate('/feedback/thanks');
    },
    onError: () => {
      navigate('/feedback/thanks');
      // toast.error('No se pudo enviar el feedback. Por favor, intenta nuevamente.');
    },
  });

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error('Por favor, selecciona una calificación general');
      return;
    }

    if (wouldRecommend === null) {
      toast.error('Por favor, indica si recomendarías nuestro servicio');
      return;
    }

    submitFeedback({
      appointmentId: appointmentId!,
      rating,
      professionalAttention,
      communicationClarity,
      consultationSatisfaction,
      platformExperience,
      comment,
      wouldRecommend: wouldRecommend || false,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Card className="max-w-3xl mx-auto p-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary">
            ¿Cómo fue tu experiencia?
          </h1>
          <p className="text-muted-foreground text-lg">
            Tu opinión nos ayuda a mejorar nuestro servicio
          </p>
        </div>

        <div className="space-y-4">
          {/* Calificación General */}
          <div className="space-y-4 bg-white p-4 rounded-lg border">
            <Label className="text-lg font-medium">
              Calificación general de la consulta
            </Label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`p-2 rounded-full transition-all ${
                    rating >= star
                      ? 'text-yellow-400 hover:text-yellow-500'
                      : 'text-gray-300 hover:text-gray-400'
                  }`}
                >
                  <StarIcon className="w-10 h-10 fill-current" />
                </button>
              ))}
            </div>
          </div>

          {/* Atención del Profesional */}
          <div className="space-y-4 bg-white p-4 rounded-lg border">
            <Label className="text-lg font-medium">
              ¿Cómo calificarías la atención del profesional?
            </Label>
            <RadioGroup
              value={professionalAttention}
              onValueChange={(value: 'excellent' | 'good' | 'fair' | 'poor') => setProfessionalAttention(value)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excellent" id="excellent-att" />
                <Label htmlFor="excellent-att">Excelente</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="good" id="good-att" />
                <Label htmlFor="good-att">Buena</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fair" id="fair-att" />
                <Label htmlFor="fair-att">Regular</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="poor" id="poor-att" />
                <Label htmlFor="poor-att">Mala</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Claridad en la Comunicación */}
          <div className="space-y-4 bg-white p-4 rounded-lg border">
            <Label className="text-lg font-medium">
              ¿La comunicación durante la consulta fue clara?
            </Label>
            <RadioGroup
              value={communicationClarity}
              onValueChange={(value: 'excellent' | 'good' | 'fair' | 'poor') => setCommunicationClarity(value)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excellent" id="excellent-comm" />
                <Label htmlFor="excellent-comm">Excelente</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="good" id="good-comm" />
                <Label htmlFor="good-comm">Buena</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fair" id="fair-comm" />
                <Label htmlFor="fair-comm">Regular</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="poor" id="poor-comm" />
                <Label htmlFor="poor-comm">Mala</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Satisfacción General */}
          <div className="space-y-4 bg-white p-4 rounded-lg border">
            <Label className="text-lg font-medium">
              ¿Qué tan satisfecho estás con la consulta?
            </Label>
            <RadioGroup
              value={consultationSatisfaction}
              onValueChange={(value: 'very_satisfied' | 'satisfied' | 'unsatisfied' | 'very_unsatisfied') => setConsultationSatisfaction(value)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="very_satisfied" id="very_satisfied" />
                <Label htmlFor="very_satisfied">Muy satisfecho</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="satisfied" id="satisfied" />
                <Label htmlFor="satisfied">Satisfecho</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unsatisfied" id="unsatisfied" />
                <Label htmlFor="unsatisfied">Insatisfecho</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="very_unsatisfied" id="very_unsatisfied" />
                <Label htmlFor="very_unsatisfied">Muy insatisfecho</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Experiencia con la Plataforma */}
          <div className="space-y-4 bg-white p-4 rounded-lg border">
            <Label className="text-lg font-medium">
              ¿Cómo fue tu experiencia con la plataforma?
            </Label>
            <RadioGroup
              value={platformExperience}
              onValueChange={(value: 'excellent' | 'good' | 'fair' | 'poor') => setPlatformExperience(value)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excellent" id="excellent-plat" />
                <Label htmlFor="excellent-plat">Excelente</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="good" id="good-plat" />
                <Label htmlFor="good-plat">Buena</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fair" id="fair-plat" />
                <Label htmlFor="fair-plat">Regular</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="poor" id="poor-plat" />
                <Label htmlFor="poor-plat">Mala</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Recomendación */}
          <div className="space-y-4 bg-white p-4 rounded-lg border">
            <Label className="text-lg font-medium">
              ¿Recomendarías nuestro servicio?
            </Label>
            <div className="flex gap-4">
              <Button
                variant={wouldRecommend === true ? "default" : "outline"}
                onClick={() => setWouldRecommend(true)}
                className="flex-1"
              >
                Sí
              </Button>
              <Button
                variant={wouldRecommend === false ? "default" : "outline"}
                onClick={() => setWouldRecommend(false)}
                className="flex-1"
              >
                No
              </Button>
            </div>
          </div>

          {/* Comentarios */}
          <div className="space-y-4 bg-white p-4 rounded-lg border">
            <Label className="text-lg font-medium">
              ¿Hay algo más que quieras comentarnos?
            </Label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full min-h-[120px] p-4 rounded-md border border-input bg-background text-base"
              placeholder="Tu opinión es muy importante para nosotros..."
            />
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full py-6 text-lg"
            disabled={isPending}
          >
            {isPending ? 'Enviando...' : 'Enviar feedback'}
          </Button>
        </div>
      </Card>
    </div>
  );
}