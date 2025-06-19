
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Shield, UserCheck, UserX, Trash2, Loader2 } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  oab_number: string | null;
  status: 'pending' | 'active' | 'blocked';
  is_admin: boolean;
  created_at: string;
  approved_at: string | null;
  blocked_at: string | null;
  blocked_reason: string | null;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers((data || []) as UserProfile[]);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar a lista de usuários.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const updateUserStatus = async (userId: string, newStatus: 'active' | 'blocked' | 'pending', reason?: string) => {
    if (!user?.id) return;

    setActionLoading(userId);
    try {
      const { error } = await supabase.rpc('admin_update_user_status', {
        target_user_id: userId,
        new_status: newStatus,
        admin_user_id: user.id,
        reason: reason || null
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Status do usuário atualizado para ${newStatus === 'active' ? 'ativo' : newStatus === 'blocked' ? 'bloqueado' : 'pendente'}.`,
      });

      await loadUsers();
      setBlockReason('');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o status do usuário.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!user?.id) return;

    setActionLoading(userId);
    try {
      const { error } = await supabase.rpc('admin_delete_user', {
        target_user_id: userId,
        admin_user_id: user.id
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso.",
      });

      await loadUsers();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir o usuário.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'blocked':
        return <Badge variant="destructive">Bloqueado</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Carregando usuários...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Gerenciamento de Usuários
        </CardTitle>
        <CardDescription>
          Consulte, aprove, bloqueie ou exclua usuários do sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>OAB</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((userProfile) => (
                <TableRow key={userProfile.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {userProfile.full_name || 'Sem nome'}
                      {userProfile.is_admin && (
                        <Shield className="h-4 w-4 text-eco-primary" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{userProfile.email}</TableCell>
                  <TableCell>{userProfile.company_name || '-'}</TableCell>
                  <TableCell>{userProfile.oab_number || '-'}</TableCell>
                  <TableCell>{getStatusBadge(userProfile.status)}</TableCell>
                  <TableCell>{formatDate(userProfile.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {userProfile.status !== 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateUserStatus(userProfile.id, 'active')}
                          disabled={actionLoading === userProfile.id || userProfile.id === user?.id}
                        >
                          {actionLoading === userProfile.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </Button>
                      )}

                      {userProfile.status !== 'blocked' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={userProfile.id === user?.id}
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Bloquear Usuário</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja bloquear este usuário? Informe o motivo do bloqueio:
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <Textarea
                              placeholder="Motivo do bloqueio..."
                              value={blockReason}
                              onChange={(e) => setBlockReason(e.target.value)}
                            />
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => updateUserStatus(userProfile.id, 'blocked', blockReason)}
                                disabled={!blockReason.trim()}
                              >
                                Bloquear
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={userProfile.id === user?.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Isso excluirá permanentemente a conta do usuário e todos os dados associados.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteUser(userProfile.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {users.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum usuário encontrado.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserManagement;
