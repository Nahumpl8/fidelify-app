import { useNavigate } from 'react-router-dom';
import { useProgramForm } from '../../hooks/useProgramForm';
import { useOrganization } from '../../context/OrganizationContext';
import WizardLayout from '../../components/card-wizard/WizardLayout';
import WizardPreview from '../../components/card-wizard/preview/WizardPreview';
import Step1Template from '../../components/card-wizard/steps/Step1Template';
import Step2Designer from '../../components/card-wizard/steps/Step2Designer';
import Step3Content from '../../components/card-wizard/steps/Step3Content';
import Step4DataRules from '../../components/card-wizard/steps/Step4DataRules';


/**
 * CardWizard - Main page for creating/editing loyalty programs
 * Features: 2-column Porsche-style layout, 3D card flip, spotlight focus
 */
const CardWizard = () => {
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
    </WizardLayout>
  );
};

export default CardWizard;
