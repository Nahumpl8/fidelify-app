import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [step, setStep] = useState(1); // 1: datos personales, 2: datos del negocio
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    businessType: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'El nombre es requerido';
    }

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.organizationName.trim()) {
      newErrors.organizationName = 'El nombre del negocio es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateStep2()) return;

    setLoading(true);

    try {
      const { error } = await signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        organizationName: formData.organizationName,
      });

      if (error) {
        if (error.message.includes('already registered')) {
          setGeneralError('Este email ya está registrado');
        } else {
          setGeneralError(error.message);
        }
        return;
      }

      // Redirigir al dashboard
      navigate('/dashboard');
    } catch (err) {
      setGeneralError('Ocurrió un error. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={step === 1 ? 'Crea tu cuenta' : 'Tu negocio'}
      subtitle={
        step === 1
          ? 'Comienza gratis, sin tarjeta de crédito'
          : 'Cuéntanos sobre tu negocio'
      }
    >
      <Card>
        {/* Indicador de pasos */}
        <StepIndicator>
          <Step $active={step >= 1} $completed={step > 1}>
            <StepNumber>1</StepNumber>
            <StepLabel>Tu cuenta</StepLabel>
          </Step>
          <StepLine $active={step > 1} />
          <Step $active={step >= 2}>
            <StepNumber>2</StepNumber>
            <StepLabel>Tu negocio</StepLabel>
          </Step>
        </StepIndicator>

        <Form onSubmit={handleSubmit}>
          {generalError && <ErrorAlert>{generalError}</ErrorAlert>}

          {step === 1 ? (
            <>
              <Input
                label="Nombre completo"
                id="fullName"
                name="fullName"
                placeholder="Juan Pérez"
                value={formData.fullName}
                onChange={handleChange}
                error={errors.fullName}
                autoComplete="name"
              />

              <Input
                label="Email"
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                autoComplete="email"
              />

              <Input
                label="Contraseña"
                id="password"
                name="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                autoComplete="new-password"
              />

              <Input
                label="Confirmar contraseña"
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                autoComplete="new-password"
              />

              <Button type="button" fullWidth onClick={handleNextStep}>
                Continuar
              </Button>
            </>
          ) : (
            <>
              <Input
                label="Nombre de tu negocio"
                id="organizationName"
                name="organizationName"
                placeholder="Ej: La Cafetería de Ana"
                value={formData.organizationName}
                onChange={handleChange}
                error={errors.organizationName}
              />

              <SelectWrapper>
                <SelectLabel htmlFor="businessType">
                  Tipo de negocio (opcional)
                </SelectLabel>
                <Select
                  id="businessType"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="cafe">Cafetería</option>
                  <option value="restaurant">Restaurante</option>
                  <option value="bakery">Panadería</option>
                  <option value="salon">Salón de belleza</option>
                  <option value="gym">Gimnasio</option>
                  <option value="retail">Tienda</option>
                  <option value="other">Otro</option>
                </Select>
              </SelectWrapper>

              <ButtonGroup>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(1)}
                >
                  Atrás
                </Button>
                <Button type="submit" loading={loading}>
                  Crear cuenta
                </Button>
              </ButtonGroup>
            </>
          )}
        </Form>

        <Divider>
          <DividerText>¿Ya tienes cuenta?</DividerText>
        </Divider>

        <Button as={Link} to="/login" variant="secondary" fullWidth>
          Iniciar sesión
        </Button>
      </Card>

      <Terms>
        Al crear una cuenta, aceptas nuestros{' '}
        <TermsLink to="/terms">Términos de servicio</TermsLink> y{' '}
        <TermsLink to="/privacy">Política de privacidad</TermsLink>
      </Terms>
    </AuthLayout>
  );
};

const StepIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.space.xl};
`;

const Step = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.space.xs};
  opacity: ${({ $active }) => ($active ? 1 : 0.5)};
  transition: opacity ${({ theme }) => theme.transitions.fast};
`;

const StepNumber = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text.inverse};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const StepLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const StepLine = styled.div`
  width: 60px;
  height: 2px;
  background: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.border};
  margin: 0 ${({ theme }) => theme.space.sm};
  margin-bottom: 20px;
  transition: background ${({ theme }) => theme.transitions.fast};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.md};
`;

const ErrorAlert = styled.div`
  padding: ${({ theme }) => theme.space.sm} ${({ theme }) => theme.space.md};
  background: ${({ theme }) => `${theme.colors.error}15`};
  border: 1px solid ${({ theme }) => `${theme.colors.error}30`};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  text-align: center;
`;

const SelectWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.xs};
`;

const SelectLabel = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Select = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.space.sm} ${({ theme }) => theme.space.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space.md};
  margin-top: ${({ theme }) => theme.space.sm};

  > button:last-child {
    flex: 1;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: ${({ theme }) => theme.space.lg} 0;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.border};
  }
`;

const DividerText = styled.span`
  padding: 0 ${({ theme }) => theme.space.md};
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const Terms = styled.p`
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: ${({ theme }) => theme.space.lg};
`;

const TermsLink = styled(Link)`
  color: ${({ theme }) => theme.colors.text.secondary};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export default Register;
