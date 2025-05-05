import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { UserQueries } from '@/services/users/queries';
import { CheckIcon, Clock, Mail, User } from 'lucide-react';

export default function ProfessionalData() {
  const { user, setUser } = useAuth();
  const [editableInfo, setEditableInfo] = useState({
    consultationDuration: user?.consultationDuration
  });
  const [isSaved, setIsSaved] = useState(false);

  const { mutate: editUser } = useMutation({
    mutationFn: UserQueries.editUser,
    onSuccess: () => {
      if (!user) return;
      const duration = Number(editableInfo.consultationDuration) || 30;
      setUser({
        ...user,
        consultationDuration: duration
      });
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditableInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const duration = Number(editableInfo.consultationDuration) || 30;
    editUser({
      consultationDuration: duration
    });
  };

  return (
    <Card className="overflow-hidden relative">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-tertiary/10">
              <User className="h-5 w-5 text-tertiary" />
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-800">Información Profesional</h3>
              <div className="grid grid-cols-1 gap-1 mt-1">
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <User className="h-3.5 w-3.5 text-tertiary" />
                  <span>{user?.firstName || 'N/A'} {user?.lastName || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Mail className="h-3.5 w-3.5 text-tertiary" />
                  <span>{user?.email || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-end gap-3">
            <div className="w-full sm:w-auto">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="h-3.5 w-3.5 text-tertiary" />
                <Label htmlFor="consultationDuration" className="text-xs font-medium">Duración consulta (min)</Label>
              </div>
              <div className="flex gap-2">
                <Input
                  id="consultationDuration"
                  name="consultationDuration"
                  type="number"
                  value={editableInfo.consultationDuration}
                  onChange={handleChange}
                  className="h-8 text-sm w-24"
                />
                <Button
                  onClick={handleSave}
                  className="h-8 relative overflow-hidden bg-white border border-tertiary text-tertiary text-sm hover:bg-tertiary/5 px-3"
                >
                  <span className={`inline-flex items-center transition-all duration-300 ${isSaved ? "opacity-0" : "opacity-100"}`}>
                    Guardar
                  </span>
                  <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isSaved ? "opacity-100 text-tertiary" : "opacity-0"}`}>
                    <CheckIcon className="w-4 h-4" />
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
