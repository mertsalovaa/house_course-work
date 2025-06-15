import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { colors } from "../../assets/colors";
import styled from "styled-components";

import closeIcon from '../../assets/images/icons/close-icon.svg'
import { Headline2, MobileHeadline2, MobileSubHeadline1, SubHeadline1 } from "../typography";

export default function ModalWindow({
    show,
    isImportant,
    children,
    onClose,
    autoClose = null, // ms: наприклад 3000
}) {
    const modalRef = useRef();

    // Закриття по Esc
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape" && onClose) onClose();
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    // Автоматичне закриття
    useEffect(() => {
        if (show && autoClose) {
            const timer = setTimeout(() => {
                onClose?.();
            }, autoClose);
            return () => clearTimeout(timer);
        }
    }, [show, autoClose, onClose]);

    // Клік поза модалкою
    const handleBackdropClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            onClose?.();
        }
    };

    return (
        <AnimatePresence>
            {show && (
                <>
                    <motion.div
                        className="fixed inset-0 z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ backgroundColor: "rgba(5, 80, 60, 0.50)" }}
                        onClick={!isImportant ? handleBackdropClick : () => { }}
                    ></motion.div>

                    <ModalWindowStyle
                        ref={modalRef}
                        className="fixed top-1/4 left-1/2 !-translate-x-1/2 z-50 bg-transparent"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                    >
                        <div className="flex flex-col items-center">{children}</div>
                        <img className="close" src={closeIcon} alt="close-icon" onClick={onClose} />
                    </ModalWindowStyle>
                </>
            )}
        </AnimatePresence>
    );
}

const ModalWindowStyle = styled(motion.div)`
border: 2px solid ${colors.main};
border-radius: 30px;
padding: 40px;
width: 40%;
transition: all 0.4s ease-in-out;
& > *, & > * > * {
    transition: all 0.4s ease-in-out;
}
div {
    padding: 32px;
    border-radius: 30px;
    box-shadow: 0 34px 69px 0 rgba(5, 80, 60, 0.20);
    background-color: ${colors.lighter};
    gap: 20px;
    
    img {
        width: 30%;
    }
}
.close {
    background-color: ${colors.lighter};
    padding: 7px;
    border-radius: 100%;
    cursor: pointer;
    position: absolute;
    right: 29px;
    top: 29px;
    box-shadow: 0 4px 10px rgba(5, 80, 60, 0.15);
    transition: transform 300ms cubic-bezier(0.25, 0.1, 0.25, 1);

    &:active {
      transform: scale(0.85);
    }
}
${Headline2} {
    color: ${colors.main};
    text-align: center;
}
${SubHeadline1} {
    color: ${colors.additional};
    text-align: center;
    padding: 0 10px;
}

@media (max-width: 730px) {
    ${Headline2} {
        ${MobileHeadline2.componentStyle.rules.join('')};
    }
    ${SubHeadline1} {
        ${MobileSubHeadline1.componentStyle.rules.join('')};
    }
    img:not(.close) {
        width: 40%;
    }
    width: 50%;
}
@media (max-width: 1160px) {
    width: 50%;
}
@media (max-width: 940px) {
    width: 57%;
}
@media (max-width: 840px) {
    .close { 
        position: absolute;
        right: 20px;
        top: 20px; 
    }
    div {
        padding: 20px;
    }
    img:not(.close) {
        margin-top: 20px;
    }
    ${SubHeadline1} {
        margin-bottom: 15px;
    }
    width: 60%;
    padding: 28px;
}
@media (max-width: 638px) {
    span {
        gap: 8px;
        justify-content: center;
        & > * {
            width: 95%;
        }
    }
}
@media (max-width: 530px) {
    .close { 
    position: absolute;
    right: 15px;
    top: 15px; 
    }
    div {
        padding: 20px 14px;
    }
    width: 70%;
    padding: 20px;
}
`