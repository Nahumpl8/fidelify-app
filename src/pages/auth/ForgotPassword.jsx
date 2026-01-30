import { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';

const ForgotPassword = () => {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    if (!email) {
      setError('El email es requerido');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email inválido');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setLoading(true);

    try {
      const { error } = await resetPassword(email);

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('Ocurrió un error. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Recuperar contraseña"
      subtitle="Te enviaremos un enlace para restablecer tu contraseña"
    >
      <Card>
        {success ? (
          <SuccessState>
            <SuccessIcon>✉️</SuccessIcon>
            <SuccessTitle>Revisa tu correo</SuccessTitle>
            <SuccessMessage>
              Hemos enviado un enlace de recuperación a <strong>{email}</strong>
              . Revisa tu bandeja de entrada y sigue las instrucciones.
            </SuccessMessage>
            <SuccessNote>
              ¿No lo ves? Revisa tu carpeta de spam.
            </SuccessNote>
            <Button as={Link} to="/login" fullWidth>
              Volver al inicio de sesión
            </Button>
          </SuccessState>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Input
              label="Email"
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              error={error}
              autoComplete="email"
            />

            <Button type="submit" fullWidth loading={loading}>
              Enviar enlace de recuperación
            </Button>

            <BackLink to="/login">
              ← Volver al inicio de sesión
            </BackLink>
          </Form>
        )}
      </Card>
    </AuthLayout>
  );
};

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.md};
`;

const BackLink = styled(Link)`
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.space.sm};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const SuccessState = styled.div`
  text-align: center;
`;

const SuccessIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${({ theme }) => theme.space.md};
`;

const SuccessTitle = styled.h3`
  margin-bottom: ${({ theme }) => theme.space.sm};
`;

const SuccessMessage = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.space.md};
  line-height: 1.5;
`;

const SuccessNote = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.muted};
  margin-bottom: ${({ theme }) => theme.space.lg};
`;

export default ForgotPassword;
