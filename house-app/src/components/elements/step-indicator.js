import styled from "styled-components";
import { colors } from "../../assets/colors";
import { SubHeadline1 } from "../typography";

export default function StepIndicator({ currentStep, setValueStep, isValidToNext, totalSteps = 3 }) {
    const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

    function getStepClass(step, current) {
        if (step === current) return "current-step";
        if (step < current) return "previous-step";
        if (step === current + 1) return "next-step";
        return "future-step";
    }

    function getLineClass(step, current) {
        return step > current + 1 ? "future-step-item" : "";
    }

    function getLineWidth(step, current) {
        if (step > current + 1) return "w-0";
        if (step === current + 1) return "w-1/2";
        return "w-full";
    }

    function setStep(step) {
        if (currentStep === 1 && !isValidToNext() || currentStep === 3) {
            return;
        }
        setValueStep(Number.parseInt(step));

    }

    return (
        <StepsBlock className="flex items-center justify-center w-full">
            {steps.map((step, i) => (
                <span className="flex items-center gap-5" key={step}>
                    <SubHeadline1 className={getStepClass(step, currentStep)} onClick={() => setStep(step)}>
                        {step}
                    </SubHeadline1>
                    {i < steps.length - 1 && (
                        <StepItem>
                            <span className={`${getLineClass(step + 1, currentStep)} parent-progress`}></span>
                            <span className={`${getLineWidth(step + 1, currentStep)} child-progress`}></span>
                        </StepItem>
                    )}
                </span>
            ))}
        </StepsBlock>
    );
}

const StepItem = styled.span`
    display: block;
    width: 98px;
    height: 6px;
    .parent-progress {
        display: block;
        width: 100%;
        height: 100%;
        background-color: ${colors.lighter};
        border: 1px solid ${colors.additional};
        border-radius: 30px;
    }
    .child-progress {
        display: block;
        position: relative;
        top: -6px;
        border-radius: 30px;
        height: 6px;
        background-color: ${colors.accent};
        transition: width 0.4s ease-in-out;
    }
`;

const StepsBlock = styled.span`
gap: 20px;
border-bottom: 1px solid ${colors["light-green"]};
padding-bottom: 24px;
position: relative;
top: -18px;
width: 100%;
${SubHeadline1} {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: 0px;
    cursor: pointer;
    transition: background-color 0.4s ease, color 0.4s ease, border 0.4s ease;
}

.current-step, .previous-step {
    background-color: ${colors.accent};
    color: ${colors.light};
    border: 1px solid ${colors.accent};
}
.next-step {
    background-color: ${colors.lighter};
    color: ${colors.additional};
    border: 1px solid ${colors.additional};
}
.future-step {
    background-color: ${colors.lighter};
    color: ${colors["light-green"]};
    border: 1px solid ${colors["light-green"]};
}
.future-step-item {
    border: 1px solid ${colors["light-green"]} !important;
}



@media (max-width: 730px) {
     ${SubHeadline1} {
        width: 32px;
        height: 32px;
    } 
${StepItem} {
    width: 60px;
}
top: 0px;
padding-bottom: 14px;
margin-bottom: 14px;
}

`;
