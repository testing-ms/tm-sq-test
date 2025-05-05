import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserQueries } from '@/services/users/queries';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Search, Users, UserPlus, Check, Link2 } from 'lucide-react';
import { AlmaUser } from '@/services/users/types';
import { toast } from 'sonner';

const AssignUserPage = () => {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedAlmaUser, setSelectedAlmaUser] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchAlmaTerm, setSearchAlmaTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => UserQueries.getUsers(),
  });

  const { data: almaUsers } = useQuery<AlmaUser[]>({
    queryKey: ['almaUsers'],
    queryFn: () => UserQueries.getAlmaUsers(),
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ email, externalProfessionalId }: { email: string; externalProfessionalId: string }) =>
      UserQueries.updateUser(email, { externalProfessionalId }),
  });

  const updateEmailMutation = useMutation({
    mutationFn: ({ id, email }: { id: number; email: string }) =>
      UserQueries.updateAlmaUserEmail(id, email),
    onSuccess: async () => {
      toast.success('Usuario vinculado exitosamente');

      if (selectedUser && selectedAlmaUser) {
        try {
          await updateUserMutation.mutateAsync({
            email: selectedUser,
            externalProfessionalId: selectedAlmaUser.toString()
          });
        } catch (error) {
          console.error('Error al actualizar el ID profesional:', error);
          toast.error('Error al actualizar el ID profesional');
        }
      }

      // Refrescar las queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['almaUsers'] });
      setSelectedUser(null);
      setSelectedAlmaUser(null);
    },
    onError: (error) => {
      toast.error('Error al vincular usuario');
      console.error('Error:', error);
    }
  });

  const handleLink = () => {
    if (selectedUser && selectedAlmaUser) {
      updateEmailMutation.mutate({
        id: selectedAlmaUser,
        email: selectedUser
      });
    }
  };

  const filteredUsers = users?.filter(user =>
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAlmaUsers = almaUsers?.filter(user =>
    user.nombre.toLowerCase().includes(searchAlmaTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchAlmaTerm.toLowerCase()) ||
    user.rut.toLowerCase().includes(searchAlmaTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchAlmaTerm.toLowerCase())
  );

  const getUserAlmaInfo = (externalProfessionalId: string) => {
    return almaUsers?.find(user => user.id.toString() === externalProfessionalId);
  };

  const getLinkedSystemUser = (almaUserId: number) => {
    return users?.find(user => user.externalProfessionalId === almaUserId.toString());
  };

  return (
    <div className="p-6 pt-0">
      <div className="flex flex-row gap-4 mb-4">
        <div className="flex items-center gap-2">
          <UserPlus className="h-6 w-6 text-tertiary" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-medium">Asignar Usuario</h1>
          <p className="text-sm text-gray-500">Selecciona un usuario para asignarle un calendario</p>
        </div>
      </div>
      <div className="flex flex-row gap-6 items-start relative">
        <Card className="flex-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-tertiary" />
              <h2 className="text-xl font-semibold text-tertiary">Usuarios Sistema</h2>
              <span className="text-sm text-gray-500 ml-2">({filteredUsers?.length || 0})</span>
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-2">
                {filteredUsers?.map((user) => {
                  const almaUser = user.externalProfessionalId ?
                    getUserAlmaInfo(user.externalProfessionalId) : null;

                  return (
                    <div
                      key={user.email}
                      onClick={() => setSelectedUser(user.email)}
                      className={`p-4 rounded-lg transition-all cursor-pointer hover:bg-blue-50
                        ${selectedUser === user.email ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-50'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        {user.externalProfessionalId && user.externalProfessionalId !== 'user no found' && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Asignado
                          </Badge>
                        )}
                      </div>
                      {almaUser && (
                        <div className="mt-1 p-0 bg-gray-100 flex flex-row gap-2 rounded-md">
                          <span className="text-xs pl-2 font-medium text-gray-600">Usuario vinculado:</span>
                          <span className="text-xs font-medium">{almaUser.nombre}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="flex flex-col items-center gap-2 sticky top-1/2">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full p-3"
            onClick={handleLink}
            disabled={!selectedUser || !selectedAlmaUser}
          >
            <Link2 className="h-6 w-6" />
          </Button>
          <span className="text-sm text-gray-500 text-center">
            {!selectedUser && !selectedAlmaUser
              ? 'Selecciona usuarios para vincular'
              : !selectedUser
                ? 'Selecciona usuario del sistema'
                : !selectedAlmaUser
                  ? 'Selecciona usuario de Alma'
                  : 'Vincular usuarios'}
          </span>
        </div>

        <Card className="flex-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-tertiary" />
              <h2 className="text-xl font-semibold text-tertiary">Usuarios Alma</h2>
              <span className="text-sm text-gray-500 ml-2">({filteredAlmaUsers?.length || 0})</span>
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar usuario de Alma..."
                value={searchAlmaTerm}
                onChange={(e) => setSearchAlmaTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-2">
                {filteredAlmaUsers?.map((user) => {
                  const linkedUser = getLinkedSystemUser(user.id);

                  return (
                    <div
                      key={user.id}
                      onClick={() => setSelectedAlmaUser(user.id)}
                      className={`p-4 rounded-lg transition-all cursor-pointer hover:bg-blue-50
                        ${selectedAlmaUser === user.id ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-50'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{user.nombre}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          {linkedUser && (
                            <div className="mt-1 p-0 bg-gray-100 flex flex-row gap-2 rounded-md">
                              <span className="text-xs pl-2 font-medium text-gray-600">Vinculado a:</span>
                              <span className="text-xs font-medium">{linkedUser.firstName} {linkedUser.lastName}</span>
                            </div>
                          )}
                        </div>
                        {linkedUser && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Vinculado
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssignUserPage;
