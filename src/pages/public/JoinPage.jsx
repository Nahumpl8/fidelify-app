import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';

/**
 * JoinPage - Registro público de clientes en un negocio específico
 * URL: /join/:slug (ej: /join/ray-myon)
 *
 * Flujo:
 * 1. Obtiene el negocio por slug
 * 2. Muestra formulario con branding del negocio
 * 3. Crea client + loyalty_card
 * 4. Redirige a página de éxito/wallet
 */

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
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cardData, setCardData] = useState(null);

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
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // 1. Crear o encontrar el cliente
      let clientId;

      // Buscar si ya existe por email
      if (formData.email) {
        const { data: existingClient } = await supabase
          .from('clients')
          .select('id')
          .ilike('email', formData.email)
          .single();

        if (existingClient) {
          clientId = existingClient.id;
        }
      }

      // Si no existe, crear nuevo cliente
      if (!clientId) {
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            full_name: formData.full_name,
            email: formData.email || null,
            phone: formData.phone || null,
            birthday: formData.birthday || null,
          })
          .select()
          .single();

        if (clientError) throw clientError;
        clientId = newClient.id;
      }

      // 2. Verificar si ya tiene tarjeta en este negocio
      const { data: existingCard } = await supabase
        .from('loyalty_cards')
        .select('*')
        .eq('business_id', business.id)
        .eq('client_id', clientId)
        .single();

      if (existingCard) {
        // Ya tiene tarjeta, mostrar éxito con datos existentes
        setCardData(existingCard);
        setSuccess(true);
        return;
      }

      // 3. Crear la tarjeta de lealtad
      const { data: newCard, error: cardError } = await supabase
        .from('loyalty_cards')
        .insert({
          business_id: business.id,
          client_id: clientId,
          acquisition_source: 'web',
          acquisition_medium: 'join_page',
        })
        .select()
        .single();

      if (cardError) throw cardError;

      setCardData(newCard);
      setSuccess(true);

    } catch (err) {
      console.error('Error al registrar:', err);
      setError(err.message || 'Error al registrar. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Container>
        <LoadingMessage>Cargando...</LoadingMessage>
      </Container>
    );
  }

  // Error - negocio no encontrado
  if (error && !business) {
    return (
      <Container>
        <ErrorCard>
          <h2>Negocio no encontrado</h2>
          <p>El link que usaste no es válido o el negocio ya no está activo.</p>
          <BackButton onClick={() => navigate('/')}>Ir al inicio</BackButton>
        </ErrorCard>
      </Container>
    );
  }

  // Success state
  if (success) {
    return (
      <Container style={{ background: business?.background_color || '#4CAF50' }}>
        <SuccessCard>
          {business?.logo_url && (
            <Logo src={business.logo_url} alt={business.name} />
          )}
          <SuccessIcon>✓</SuccessIcon>
          <h2>¡Bienvenido a {business?.name}!</h2>
          <p>Tu tarjeta de lealtad ha sido creada.</p>

          <CardInfo>
            <InfoRow>
              <span>Programa:</span>
              <strong>{business?.program_type === 'seals' ? 'Sellos' : 'Puntos'}</strong>
            </InfoRow>
            <InfoRow>
              <span>Meta:</span>
              <strong>{business?.target_value} {business?.program_type === 'seals' ? 'sellos' : 'puntos'}</strong>
            </InfoRow>
            <InfoRow>
              <span>Premio:</span>
              <strong>{business?.reward_text}</strong>
            </InfoRow>
          </CardInfo>

          <WalletButton>
            Agregar a Apple Wallet
          </WalletButton>
          <WalletButtonAlt>
            Agregar a Google Wallet
          </WalletButtonAlt>
        </SuccessCard>
      </Container>
    );
  }

  // Formulario de registro
  return (
    <Container style={{ background: business?.background_color || '#f5f5f5' }}>
      <FormCard>
        {business?.logo_url && (
          <Logo src={business.logo_url} alt={business.name} />
        )}

        <Title style={{ color: business?.brand_color }}>
          Únete a {business?.name}
        </Title>

        <Subtitle>
          Registra tus datos para comenzar a acumular{' '}
          {business?.program_type === 'seals' ? 'sellos' : 'puntos'} y obtener recompensas.
        </Subtitle>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>Nombre completo *</Label>
            <Input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              placeholder="Tu nombre"
            />
          </InputGroup>

          <InputGroup>
            <Label>Email *</Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="tu@email.com"
            />
          </InputGroup>

          <InputGroup>
            <Label>Teléfono</Label>
            <Input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+52 123 456 7890"
            />
          </InputGroup>

          <InputGroup>
            <Label>Fecha de nacimiento</Label>
            <Input
              type="date"
              name="birthday"
              value={formData.birthday}
              onChange={handleChange}
            />
          </InputGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <SubmitButton
            type="submit"
            disabled={submitting}
            style={{ background: business?.brand_color }}
          >
            {submitting ? 'Registrando...' : 'Unirme al programa'}
          </SubmitButton>
        </Form>

        <Terms>
          Al registrarte aceptas recibir comunicaciones de {business?.name} sobre
          tu programa de lealtad.
        </Terms>
      </FormCard>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  transition: background 0.3s;
`;

const FormCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 40px;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
`;

const SuccessCard = styled(FormCard)`
  text-align: center;
`;

const ErrorCard = styled(FormCard)`
  text-align: center;
`;

const Logo = styled.img`
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin: 0 auto 20px;
  display: block;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
  text-align: center;
`;

const Subtitle = styled.p`
  color: #666;
  text-align: center;
  margin-bottom: 24px;
  font-size: 14px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #4CAF50;
  }
`;

const SubmitButton = styled.button`
  padding: 14px;
  border: none;
  border-radius: 8px;
  background: #4CAF50;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  margin-top: 8px;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: #d32f2f;
  font-size: 14px;
  background: #ffebee;
  padding: 10px;
  border-radius: 6px;
`;

const Terms = styled.p`
  font-size: 12px;
  color: #999;
  text-align: center;
  margin-top: 16px;
`;

const LoadingMessage = styled.p`
  color: #666;
  font-size: 18px;
`;

const BackButton = styled.button`
  margin-top: 20px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background: #333;
  color: white;
  cursor: pointer;
`;

const SuccessIcon = styled.div`
  width: 60px;
  height: 60px;
  background: #4CAF50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 32px;
  margin: 0 auto 20px;
`;

const CardInfo = styled.div`
  background: #f5f5f5;
  border-radius: 12px;
  padding: 16px;
  margin: 20px 0;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;

  &:last-child {
    border-bottom: none;
  }

  span {
    color: #666;
  }
`;

const WalletButton = styled.button`
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  background: #000;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 10px;
`;

const WalletButtonAlt = styled(WalletButton)`
  background: #4285f4;
`;

export default JoinPage;
