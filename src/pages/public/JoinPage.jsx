import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { supabase } from '../../lib/supabase';
import {
  generateApplePass,
  downloadApplePass,
  generateGooglePass,
  openGoogleWalletSave,
  supportsAppleWallet,
  supportsGoogleWallet,
} from '../../services/wallet';
import { User, Mail, Phone, Calendar, Lock, ArrowRight, CheckCircle, Gift } from 'lucide-react';

const JoinPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  // Estado del negocio
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    birthday: '',
    password: '',
    confirmPassword: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cardData, setCardData] = useState(null);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);

  // Estado de wallet
  const [walletLoading, setWalletLoading] = useState({ apple: false, google: false });
  const [walletError, setWalletError] = useState(null);
  const [walletSuccess, setWalletSuccess] = useState({ apple: false, google: false });

  // Cargar datos del negocio
  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('businesses')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .single();

        if (fetchError || !data) {
          setError('Negocio no encontrado');
          return;
        }

        setBusiness(data);
      } catch (err) {
        setError('Error al cargar el negocio');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchBusiness();
    }
  }, [slug]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Validar contraseña
    if (!formData.password || formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setSubmitting(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setSubmitting(false);
      return;
    }

    try {
      // 1. Crear cuenta de auth con rol de cliente
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: 'client',
            full_name: formData.full_name,
          },
          emailRedirectTo: `${window.location.origin}/portal`,
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('Ya existe una cuenta con este email. Inicia sesión en el portal.');
          setSubmitting(false);
          return;
        }
        throw authError;
      }

      // Si no hay sesión, email confirmation está activada
      if (!authData.session) {
        setPendingConfirmation(true);
        setSubmitting(false);
        return;
      }

      const userId = authData.user.id;

      // 2. Buscar si ya existe client por email y linkear
      let clientId;
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .ilike('email', formData.email)
        .single();

      if (existingClient) {
        // Linkear auth_user_id al client existente
        await supabase
          .from('clients')
          .update({
            auth_user_id: userId,
            full_name: formData.full_name,
            phone: formData.phone || null,
            birthday: formData.birthday || null,
          })
          .eq('id', existingClient.id);
        clientId = existingClient.id;
      } else {
        // Crear nuevo client con auth_user_id
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            auth_user_id: userId,
            full_name: formData.full_name,
            email: formData.email,
            phone: formData.phone || null,
            birthday: formData.birthday || null,
          })
          .select()
          .single();

        if (clientError) throw clientError;
        clientId = newClient.id;
      }

      // 3. Verificar si ya tiene tarjeta en este negocio
      const { data: existingCard } = await supabase
        .from('loyalty_cards')
        .select('*')
        .eq('business_id', business.id)
        .eq('client_id', clientId)
        .single();

      if (!existingCard) {
        // 4. Crear la tarjeta de lealtad
        await supabase
          .from('loyalty_cards')
          .insert({
            business_id: business.id,
            client_id: clientId,
            acquisition_source: 'web',
            acquisition_medium: 'join_page',
          });
      }

      // 5. Redirigir al portal del cliente
      navigate('/portal', {
        state: {
          welcomeMessage: `¡Bienvenido a ${business.name}! Tu cuenta ha sido creada.`,
        },
      });

    } catch (err) {
      console.error('Error al registrar:', err);
      setError(err.message || 'Error al registrar. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handler para Apple Wallet
  const handleAddToAppleWallet = async () => {
    if (!cardData?.id) return;

    setWalletLoading(prev => ({ ...prev, apple: true }));
    setWalletError(null);

    try {
      const result = await generateApplePass(cardData.id);
      if (result.success && result.downloadUrl) {
        downloadApplePass(result.downloadUrl);
        setWalletSuccess(prev => ({ ...prev, apple: true }));
      } else {
        setWalletError(result.error || 'Error al generar pase de Apple');
      }
    } catch (err) {
      setWalletError('Error de conexión');
    } finally {
      setWalletLoading(prev => ({ ...prev, apple: false }));
    }
  };

  // Handler para Google Wallet
  const handleAddToGoogleWallet = async () => {
    if (!cardData?.id) return;

    setWalletLoading(prev => ({ ...prev, google: true }));
    setWalletError(null);

    try {
      const result = await generateGooglePass(cardData.id);
      if (result.success && result.saveUrl) {
        openGoogleWalletSave(result.saveUrl);
        setWalletSuccess(prev => ({ ...prev, google: true }));
      } else {
        setWalletError(result.error || 'Error al generar pase de Google');
      }
    } catch (err) {
      setWalletError('Error de conexión');
    } finally {
      setWalletLoading(prev => ({ ...prev, google: false }));
    }
  };

  // Loading state
  if (loading) {
    return (
      <Container>
        <Spinner />
      </Container>
    );
  }

  // Error - negocio no encontrado
  if (error && !business) {
    return (
      <Container>
        <Card>
          <ErrorIconWrapper>
            <Gift size={36} />
          </ErrorIconWrapper>
          <Title>Negocio no encontrado</Title>
          <SubtitleText>El link que usaste no es válido o el negocio ya no está activo.</SubtitleText>
          <BackButton onClick={() => navigate('/')}>
            Ir al inicio
            <ArrowRight size={18} />
          </BackButton>
        </Card>
      </Container>
    );
  }

  // Pending email confirmation state
  if (pendingConfirmation) {
    return (
      <Container>
        <Card>
          {business?.logo_url && (
            <Logo src={business.logo_url} alt={business.name} />
          )}
          <ConfirmIconWrapper>
            <Mail size={36} />
          </ConfirmIconWrapper>
          <Title>Revisa tu email</Title>
          <SubtitleText>
            Enviamos un link de confirmación a <strong>{formData.email}</strong>.
            Haz clic en el link para activar tu cuenta y acceder a tu tarjeta de lealtad.
          </SubtitleText>
          <LoginLinkButton to="/client/login">
            Ya confirmé, iniciar sesión
            <ArrowRight size={18} />
          </LoginLinkButton>
        </Card>
      </Container>
    );
  }

  // Success state
  if (success) {
    return (
      <Container>
        <Card>
          {business?.logo_url && (
            <Logo src={business.logo_url} alt={business.name} />
          )}
          <SuccessIconWrapper>
            <CheckCircle size={40} />
          </SuccessIconWrapper>
          <Title>¡Bienvenido a {business?.name}!</Title>
          <SubtitleText>Tu tarjeta de lealtad ha sido creada.</SubtitleText>

          <CardInfo>
            <InfoRow>
              <InfoLabel>Programa</InfoLabel>
              <InfoValue>{business?.program_type === 'seals' ? 'Sellos' : 'Puntos'}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Meta</InfoLabel>
              <InfoValue>{business?.target_value} {business?.program_type === 'seals' ? 'sellos' : 'puntos'}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Premio</InfoLabel>
              <InfoValue>{business?.reward_text}</InfoValue>
            </InfoRow>
          </CardInfo>

          {walletError && <ErrorMessage>{walletError}</ErrorMessage>}

          {supportsAppleWallet() && (
            <WalletButton
              onClick={handleAddToAppleWallet}
              disabled={walletLoading.apple || walletSuccess.apple}
            >
              {walletLoading.apple
                ? 'Generando...'
                : walletSuccess.apple
                ? 'Descargado'
                : 'Agregar a Apple Wallet'}
            </WalletButton>
          )}

          <WalletButtonGoogle
            onClick={handleAddToGoogleWallet}
            disabled={walletLoading.google || walletSuccess.google}
          >
            {walletLoading.google
              ? 'Generando...'
              : walletSuccess.google
              ? 'Agregado'
              : 'Agregar a Google Wallet'}
          </WalletButtonGoogle>

          <SkipLink onClick={() => navigate('/')}>
            Omitir por ahora
          </SkipLink>
        </Card>
      </Container>
    );
  }

  // Formulario de registro
  return (
    <Container>
      <Card>
        {business?.logo_url ? (
          <Logo src={business.logo_url} alt={business.name} />
        ) : (
          <LogoPlaceholder>
            <Gift size={36} />
          </LogoPlaceholder>
        )}

        <Title>Únete a {business?.name}</Title>
        <SubtitleText>
          Registra tus datos para comenzar a acumular{' '}
          {business?.program_type === 'seals' ? 'sellos' : 'puntos'} y obtener recompensas.
        </SubtitleText>

        {business?.reward_text && (
          <RewardBadge>
            <Gift size={16} />
            {business.reward_text}
          </RewardBadge>
        )}

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <InputIcon><User size={20} /></InputIcon>
            <Input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              placeholder="Nombre completo"
            />
          </InputGroup>

          <InputGroup>
            <InputIcon><Mail size={20} /></InputIcon>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="tu@email.com"
            />
          </InputGroup>

          <InputRow>
            <InputGroup>
              <InputIcon><Phone size={20} /></InputIcon>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Teléfono"
              />
            </InputGroup>

            <InputGroup>
              <InputIcon><Calendar size={20} /></InputIcon>
              <Input
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                placeholder="Cumpleaños"
              />
            </InputGroup>
          </InputRow>

          <InputGroup>
            <InputIcon><Lock size={20} /></InputIcon>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Contraseña (mín. 6 caracteres)"
              autoComplete="new-password"
            />
          </InputGroup>

          <InputGroup>
            <InputIcon><Lock size={20} /></InputIcon>
            <Input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirmar contraseña"
              autoComplete="new-password"
            />
          </InputGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <SubmitButton type="submit" disabled={submitting}>
            {submitting ? 'Registrando...' : 'Unirme al programa'}
            {!submitting && <ArrowRight size={18} />}
          </SubmitButton>
        </Form>

        <Divider />

        <FooterText>
          ¿Ya tienes cuenta? <LoginLink to="/client/login">Inicia sesión aquí</LoginLink>
        </FooterText>
        <LegalText>
          Al registrarte aceptas recibir comunicaciones de {business?.name} sobre
          tu programa de lealtad.
        </LegalText>
      </Card>
    </Container>
  );
};

// Animations
const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const Card = styled.div`
  background: white;
  border-radius: 24px;
  padding: 40px 28px;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ${fadeInUp} 0.4s ease-out;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: ${spin} 0.6s linear infinite;
`;

const Logo = styled.img`
  width: 96px;
  height: 96px;
  object-fit: contain;
  margin: 0 auto 20px;
  display: block;
  border-radius: 20px;
`;

const LogoPlaceholder = styled.div`
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  text-align: center;
  color: #1a202c;
`;

const SubtitleText = styled.p`
  color: #718096;
  text-align: center;
  margin: 0 0 20px 0;
  font-size: 15px;
  line-height: 1.5;
`;

const RewardBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #f6e05e 0%, #ed8936 100%);
  color: #744210;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 16px;
  border-radius: 12px;
  margin-bottom: 24px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const InputRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
`;

const InputGroup = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  pointer-events: none;
  display: flex;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px 14px 46px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: border-color 0.2s;
  box-sizing: border-box;
  background: #f7fafc;

  &:focus {
    outline: none;
    border-color: #667eea;
    background: white;
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
  margin: 24px 0 16px;
`;

const FooterText = styled.p`
  font-size: 14px;
  color: #718096;
  text-align: center;
  margin: 0 0 8px 0;
`;

const LegalText = styled.p`
  font-size: 12px;
  color: #a0aec0;
  text-align: center;
  margin: 0;
  line-height: 1.4;
`;

const LoginLink = styled(Link)`
  color: #667eea;
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const LoginLinkButton = styled(Link)`
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
  text-decoration: none;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-1px);
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0 auto;
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-1px);
  }
`;

const ErrorIconWrapper = styled.div`
  width: 72px;
  height: 72px;
  background: #fff5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: #e53e3e;
`;

const ConfirmIconWrapper = styled.div`
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
`;

const SuccessIconWrapper = styled.div`
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #48bb78, #38a169);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
`;

const CardInfo = styled.div`
  background: #f7fafc;
  border-radius: 14px;
  padding: 4px 16px;
  margin: 20px 0;
  border: 1px solid #e2e8f0;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;

  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  color: #718096;
  font-size: 14px;
`;

const InfoValue = styled.span`
  color: #1a202c;
  font-weight: 600;
  font-size: 14px;
`;

const WalletButton = styled.button`
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: #1a202c;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 10px;
  transition: transform 0.2s, opacity 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const WalletButtonGoogle = styled(WalletButton)`
  background: #4285f4;
`;

const SkipLink = styled.button`
  display: block;
  background: none;
  border: none;
  color: #718096;
  font-size: 14px;
  cursor: pointer;
  margin: 12px auto 0;
  text-decoration: underline;

  &:hover {
    color: #4a5568;
  }
`;

export default JoinPage;
