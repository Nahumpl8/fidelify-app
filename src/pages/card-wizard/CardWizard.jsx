import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgramForm } from '../../hooks/useProgramForm';
import { useOrganization } from '../../context/OrganizationContext';
import WizardLayout from '../../components/card-wizard/WizardLayout';
import WizardPreview from '../../components/card-wizard/preview/WizardPreview';
import Step1Template from '../../components/card-wizard/steps/Step1Template';
import Step2Designer from '../../components/card-wizard/steps/Step2Designer';
import Step3Content from '../../components/card-wizard/steps/Step3Content';
import Step4DataRules from '../../components/card-wizard/steps/Step4DataRules';
import { isValidImageUrl } from '../../utils/generateStripImage';


/**
 * CardWizard - Main page for creating/editing loyalty programs
 * Features: 2-column Porsche-style layout, 3D card flip, spotlight focus
 */
const CardWizard = () => {
  const navigate = useNavigate();
  const { organization } = useOrganization();
  const [saveMessage, setSaveMessage] = useState(null);
  const previewRef = useRef(null);

  const {
    formState,
    currentStep,
    errors,
    isSubmitting,

    // Navigation
    nextStep,
    prevStep,
    canProceed,

    // Updates
    updateField,
    updateBranding,
    updateRules,
    updateBackSide,
    updateDataCollection,
    updateFeatures,
    updateStripConfig,
    setType,
    applyTemplate,

    // Links
    addLink,
    updateLink,
    removeLink,

    // Images
    uploadImage,
    uploadProgressiveImages,

    // Preview simulation
    simulatedProgress,
    setSimulatedProgress,

    // Spotlight focus
    activeFocusField,
    setActiveFocusField,

    // Persistence
    saveProgram,
  } = useProgramForm();

  const handleSave = async () => {
    console.log('🔵 Saving program...');
    console.log('Organization:', organization);
    console.log('Form state branding:', formState.branding_config);

    setSaveMessage(null);

    if (!organization?.id) {
      const errorMsg = 'Error: No hay negocio seleccionado. Por favor recarga la página.';
      console.error(errorMsg);
      setSaveMessage({ type: 'error', text: errorMsg });
      alert(errorMsg);
      return;
    }

    // Capture strip design from DOM before saving (if no valid strip URL exists)
    const hasValidStrip = isValidImageUrl(formState.branding_config?.strip_image_url);
    const hasValidHero = isValidImageUrl(formState.branding_config?.hero_image_url);

    if (!hasValidStrip && !hasValidHero && previewRef.current?.captureStrip) {
      console.log('📸 Capturing strip design before save...');
      const capturedUrl = await previewRef.current.captureStrip();
      if (capturedUrl) {
        updateBranding({
          strip_image_url: capturedUrl,
          hero_image_url: capturedUrl,
        });
        // Small delay to ensure state update propagates
        await new Promise(r => setTimeout(r, 100));
      }
    }

    const result = await saveProgram();
    console.log('Save result:', result);

    if (result.error) {
      const errorMsg = `Error al guardar: ${result.error}`;
      console.error(errorMsg);
      setSaveMessage({ type: 'error', text: errorMsg });
      alert(errorMsg);
      return;
    }

    if (result.data) {
      console.log('✅ Program saved successfully:', result.data);
      setSaveMessage({ type: 'success', text: 'Programa guardado correctamente' });
      alert('Programa guardado correctamente');
      navigate('/dashboard');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Template
            selectedTemplate={formState.selectedTemplate}
            onSelectTemplate={applyTemplate}
          />
        );

      case 2:
        return (
          <Step2Designer
            formState={formState}
            updateField={updateField}
            updateBranding={updateBranding}
            updateRules={updateRules}
            updateStripConfig={updateStripConfig}
            uploadImage={uploadImage}
            uploadProgressiveImages={uploadProgressiveImages}
            setActiveFocusField={setActiveFocusField}
            onBack={prevStep}
            simulatedProgress={simulatedProgress}
            setSimulatedProgress={setSimulatedProgress}
          />
        );

      case 3:
        return (
          <Step3Content
            formState={formState}
            updateField={updateField}
            updateBackSide={updateBackSide}
            updateBranding={updateBranding}
            addLink={addLink}
            updateLink={updateLink}
            removeLink={removeLink}
          />
        );

      case 4:
        return (
          <Step4DataRules
            formState={formState}
            updateRules={updateRules}
            updateDataCollection={updateDataCollection}
            updateFeatures={updateFeatures}
          />
        );

      default:
        return null;
    }
  };

  return (
    <WizardLayout
      currentStep={currentStep}
      onPrevStep={prevStep}
      onNextStep={nextStep}
      onSave={handleSave}
      canProceed={canProceed()}
      isSubmitting={isSubmitting}
      previewComponent={
        <WizardPreview
          ref={previewRef}
          formState={formState}
          simulatedProgress={simulatedProgress}
          setSimulatedProgress={setSimulatedProgress}
          organizationName={organization?.name || 'Mi Negocio'}
          organizationId={organization?.id || null}
          currentStep={currentStep}
          activeFocusField={activeFocusField}
        />
      }
    >
      {renderStep()}
    </WizardLayout>
  );
};

export default CardWizard;
