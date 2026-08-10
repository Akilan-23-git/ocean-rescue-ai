import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, Stepper, Step, StepLabel, StepButton, alpha } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { MISSION_WORKFLOW_STEPS, WORKFLOW_STEPPER_HEIGHT } from '@/constants/layout';

interface MissionWorkflowStepperProps {
  currentPhase: number;
}

export function MissionWorkflowStepper({ currentPhase }: MissionWorkflowStepperProps) {
  const { missionId } = useParams<{ missionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  if (!missionId || location.pathname.includes('/missions/new')) return null;

  const activeStep = currentPhase - 1;

  return (
    <Box
      sx={{
        height: WORKFLOW_STEPPER_HEIGHT,
        mb: 2.5,
        px: 2,
        py: 1,
        borderRadius: 2,
        bgcolor: (theme) => alpha(theme.palette.background.paper, 0.6),
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Stepper
        activeStep={activeStep}
        alternativeLabel
        sx={{
          width: '100%',
          '& .MuiStepLabel-label': { fontSize: '0.6875rem', mt: '4px !important' },
          '& .MuiStepConnector-line': { borderColor: 'divider' },
        }}
      >
        {MISSION_WORKFLOW_STEPS.map((step) => {
          const isComplete = step.phase < currentPhase;
          const isClickable = step.phase <= currentPhase && step.phase !== 1;

          return (
            <Step key={step.phase} completed={isComplete}>
              <StepButton
                onClick={() => {
                  if (isClickable) {
                    navigate(`/missions/${missionId}/${step.path}`);
                  }
                }}
                disabled={!isClickable}
                icon={
                  isComplete ? (
                    <CheckIcon sx={{ fontSize: 18 }} />
                  ) : undefined
                }
              >
                <StepLabel
                  StepIconProps={{
                    sx: {
                      '&.Mui-completed': { color: 'success.main' },
                      '&.Mui-active': { color: 'secondary.main' },
                    },
                  }}
                >
                  {step.label}
                </StepLabel>
              </StepButton>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
}
