import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { toast } from 'react-hot-toast';
import type { RegisterData } from '../contexts/UserContext';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { registerUser } = useUser();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    cpf: '',
    birthdate: '',
    phone: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: ''
    },
    acceptTerms: false
  });

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent as keyof typeof formData] as Record<string, string>,
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) newErrors.name = 'Nome é obrigatório';
    if (!formData.email) newErrors.email = 'Email é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    
    if (!formData.password) newErrors.password = 'Senha é obrigatória';
    else if (formData.password.length < 6) newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.cpf) newErrors.cpf = 'CPF é obrigatório';
    else if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/.test(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }
    
    if (!formData.birthdate) newErrors.birthdate = 'Data de nascimento é obrigatória';
    if (!formData.phone) newErrors.phone = 'Telefone é obrigatório';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    const address = formData.address;
    
    if (!address.street) newErrors['address.street'] = 'Rua é obrigatória';
    if (!address.number) newErrors['address.number'] = 'Número é obrigatório';
    if (!address.neighborhood) newErrors['address.neighborhood'] = 'Bairro é obrigatório';
    if (!address.city) newErrors['address.city'] = 'Cidade é obrigatória';
    if (!address.state) newErrors['address.state'] = 'Estado é obrigatório';
    if (!address.zipCode) newErrors['address.zipCode'] = 'CEP é obrigatório';
    
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Você precisa aceitar os termos';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    let isValid = false;
    
    if (step === 1) isValid = validateStep1();
    else if (step === 2) isValid = validateStep2();
    
    if (isValid) setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 3 && validateStep3()) {
      try {
        // Remover campos desnecessários e formatar dados para o registro
        const registrationData: RegisterData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          cpf: formData.cpf,
          birthdate: formData.birthdate,
          phone: formData.phone,
          address: {
            street: formData.address.street,
            number: formData.address.number,
            complement: formData.address.complement || '',
            neighborhood: formData.address.neighborhood,
            city: formData.address.city,
            state: formData.address.state,
            zipCode: formData.address.zipCode
          },
          acceptTerms: formData.acceptTerms
        };

        await registerUser(registrationData);
        toast.success('Cadastro realizado com sucesso!');
        navigate('/dashboard');
      } catch (error: Error | unknown) {
        console.error('Erro no cadastro:', error);
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error('Erro ao realizar cadastro. Tente novamente.');
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Cadastre-se</h1>
          <p className="mt-2 text-gray-600">
            Junte-se à comunidade FURIA
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex flex-col items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    s === step ? 'bg-black text-white' : 
                    s < step ? 'bg-gray-300 text-gray-700' : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {s}
                </div>
                <span className="text-xs mt-1">
                  {s === 1 ? 'Conta' : s === 2 ? 'Pessoal' : 'Endereço'}
                </span>
              </div>
            ))}

            <div className={`h-1 flex-1 mx-2 ${step > 1 ? 'bg-gray-300' : 'bg-gray-200'}`}></div>
            <div className={`h-1 flex-1 mx-2 ${step > 2 ? 'bg-gray-300' : 'bg-gray-200'}`}></div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nome completo
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="input mt-1 block w-full"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input mt-1 block w-full"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Senha
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="input mt-1 block w-full"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar senha
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="input mt-1 block w-full"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">
                  CPF
                </label>
                <input
                  id="cpf"
                  name="cpf"
                  type="text"
                  required
                  placeholder="000.000.000-00"
                  className="input mt-1 block w-full"
                  value={formData.cpf}
                  onChange={handleChange}
                />
                {errors.cpf && <p className="mt-1 text-sm text-red-600">{errors.cpf}</p>}
              </div>

              <div>
                <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700">
                  Data de nascimento
                </label>
                <input
                  id="birthdate"
                  name="birthdate"
                  type="date"
                  required
                  className="input mt-1 block w-full"
                  value={formData.birthdate}
                  onChange={handleChange}
                />
                {errors.birthdate && <p className="mt-1 text-sm text-red-600">{errors.birthdate}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Telefone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="(00) 00000-0000"
                  className="input mt-1 block w-full"
                  value={formData.phone}
                  onChange={handleChange}
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                  Rua
                </label>
                <input
                  id="street"
                  name="address.street"
                  type="text"
                  required
                  className="input mt-1 block w-full"
                  value={formData.address.street}
                  onChange={handleChange}
                />
                {errors['address.street'] && <p className="mt-1 text-sm text-red-600">{errors['address.street']}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="number" className="block text-sm font-medium text-gray-700">
                    Número
                  </label>
                  <input
                    id="number"
                    name="address.number"
                    type="text"
                    required
                    className="input mt-1 block w-full"
                    value={formData.address.number}
                    onChange={handleChange}
                  />
                  {errors['address.number'] && <p className="mt-1 text-sm text-red-600">{errors['address.number']}</p>}
                </div>

                <div>
                  <label htmlFor="complement" className="block text-sm font-medium text-gray-700">
                    Complemento
                  </label>
                  <input
                    id="complement"
                    name="address.complement"
                    type="text"
                    className="input mt-1 block w-full"
                    value={formData.address.complement}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700">
                  Bairro
                </label>
                <input
                  id="neighborhood"
                  name="address.neighborhood"
                  type="text"
                  required
                  className="input mt-1 block w-full"
                  value={formData.address.neighborhood}
                  onChange={handleChange}
                />
                {errors['address.neighborhood'] && <p className="mt-1 text-sm text-red-600">{errors['address.neighborhood']}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    Cidade
                  </label>
                  <input
                    id="city"
                    name="address.city"
                    type="text"
                    required
                    className="input mt-1 block w-full"
                    value={formData.address.city}
                    onChange={handleChange}
                  />
                  {errors['address.city'] && <p className="mt-1 text-sm text-red-600">{errors['address.city']}</p>}
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                    Estado
                  </label>
                  <input
                    id="state"
                    name="address.state"
                    type="text"
                    required
                    className="input mt-1 block w-full"
                    value={formData.address.state}
                    onChange={handleChange}
                  />
                  {errors['address.state'] && <p className="mt-1 text-sm text-red-600">{errors['address.state']}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                  CEP
                </label>
                <input
                  id="zipCode"
                  name="address.zipCode"
                  type="text"
                  required
                  placeholder="00000-000"
                  className="input mt-1 block w-full"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                />
                {errors['address.zipCode'] && <p className="mt-1 text-sm text-red-600">{errors['address.zipCode']}</p>}
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="acceptTerms"
                    name="acceptTerms"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 focus:ring-black"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="acceptTerms" className="font-medium text-gray-700">
                    Aceito os termos e condições
                  </label>
                  <p className="text-gray-500">
                    Ao se cadastrar, você concorda com nossa {' '}
                    <Link to="/privacy" className="link">política de privacidade</Link>.
                  </p>
                  {errors.acceptTerms && <p className="mt-1 text-sm text-red-600">{errors.acceptTerms}</p>}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-between">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="btn btn-secondary py-2 px-4"
              >
                Voltar
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn btn-primary py-2 px-4 ml-auto"
              >
                Próximo
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-primary py-2 px-4 ml-auto"
              >
                Cadastrar
              </button>
            )}
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link to="/login" className="link">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;