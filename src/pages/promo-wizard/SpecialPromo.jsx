import { useNavigate } from 'react-router-dom';
import { useProgramForm } from '../../hooks/useProgramForm';
import { useOrganization } from '../../context/OrganizationContext';
import WizardContainer from '../../components/card-wizard/WizardContainer';
import WizardPreview from '../../components/card-wizard/preview/WizardPreview';
import PromoWizardStep1Type from '../../components/promo-wizard/PromoWizardStep1Type';
import Step2Designer from '../../components/card-wizard/steps/Step2Designer';
import Step3Content from '../../components/card-wizard/steps/Step3Content';
import Step4DataRules from '../../components/card-wizard/steps/Step4DataRules';

/**
 * SpecialPromo - Main page for creating special promotions
 * Features: Same as CardWizard but limited to specific promotion types
 */
const SpecialPromo = () => {
  const navigate = useNavigate();
  const { organization } = useOrganization();

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
    const result = await saveProgram();
    if (result.data) {
      navigate('/dashboard');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PromoWizardStep1Type
            selectedType={formState.type}
            onSelectType={setType}
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
    <WizardContainer
      currentStep={currentStep}
      onPrevStep={prevStep}
      onNextStep={nextStep}
      onSave={handleSave}
      canProceed={canProceed()}
      isSubmitting={isSubmitting}
      previewComponent={
        <WizardPreview
          formState={formState}
          simulatedProgress={simulatedProgress}
          setSimulatedProgress={setSimulatedProgress}
          organizationName={organization?.name || 'Mi Negocio'}
          currentStep={currentStep}
          activeFocusField={activeFocusField}
        />
      }
    >
      {renderStep()}
    </WizardContainer>
  );
};

export default SpecialPromo;
