import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';
import { Wallet, Mail, Lock, ArrowRight } from 'lucide-react';

const ClientLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('Email o contraseña incorrectos');
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Tu email aún no está confirmado. Revisa tu bandeja de entrada.');
        } else {
          setError(authError.message);
        }
        return;
      }

      // Verify user is a client
      if (data.user?.user_metadata?.role !== 'client') {
        setError('Esta cuenta no es de cliente. ¿Eres dueño de negocio?');
        await supabase.auth.signOut();
        return;
      }

      navigate('/portal');
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <LoginCard>
        <Header>
          <LogoIcon>
            <Wallet size={32} />
          </LogoIcon>
          <Title>Portal Fidelify</Title>
          <Subtitle>Accede a tus tarjetas de lealtad</Subtitle>
        </Header>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <InputIcon><Mail size={20} /></InputIcon>
            <Input
              type="email"
              name="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </InputGroup>

          <InputGroup>
            <InputIcon><Lock size={20} /></InputIcon>
            <Input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </InputGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <SubmitButton type="submit" disabled={loading}>
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
            {!loading && <ArrowRight size={18} />}
          </SubmitButton>
        </Form>

        <Divider />

        <LinksSection>
          <BusinessLink>
            ¿Eres dueño de negocio? <StyledLink to="/login">Ingresa aquí</StyledLink>
          </BusinessLink>
        </LinksSection>
      </LoginCard>
    </Container>
  );
};

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 40px 28px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const LogoIcon = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: white;
`;

const Title = styled.h1`
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 6px 0;
  color: #1a202c;
`;

const Subtitle = styled.p`
  color: #718096;
  font-size: 15px;
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InputGroup = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  pointer-events: none;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: border-color 0.2s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #667eea;
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

const ErrorMessage = styled.p`
  color: #e53e3e;
  font-size: 14px;
  background: #fff5f5;
  padding: 12px;
  border-radius: 10px;
  margin: 0;
  text-align: center;
`;

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
  margin-top: 4px;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: #e2e8f0;
  margin: 24px 0;
`;

const LinksSection = styled.div`
  text-align: center;
`;

const BusinessLink = styled.p`
  font-size: 14px;
  color: #718096;
  margin: 0;
`;

const StyledLink = styled(Link)`
  color: #667eea;
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export default ClientLogin;
