import { createContext, useContext, useState } from "react";
import Modal from 'react-modal';
import LoginForm from "../components/LoginForm";
import RomList from '../components/RomList';
import RegisterForm from "../components/RegisterForm";
import UserRoms from "../components/UserRoms";
import Profile from "../components/Profile";
import Settings from "../components/Settings";
import { useEmulator } from "./emulator.context";

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [modal, setModal] = useState({ type: null, props: {} });
    const { emulator } = useEmulator();

    const openModal = (type, props = {}) => {
        // if (isRunning) {
        //     emulator.pauseGame();
        //     setIsRunning(false);
        //     setStatus('Pausado');
        // }
        emulator.toggleInput(false)
        setModal({ type: null, props: {} });
        setTimeout(() => setModal({ type, props }), 10);
    };
    const closeModal = () => {
        emulator.toggleInput(true);
        setModal({ type: null, props: {} })
    };

    const renderModal = () => {
        const common = {
            isOpen: modal.type !== null,
            onRequestClose: closeModal,
            closeTimeoutMS: 300,
            overlayClassName: {
                base: "fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm opacity-0 transition-opacity duration-300",
                afterOpen: "opacity-100",
                beforeClose: "opacity-0"
            },
            className: {
                base: "bg-gray-900 rounded-lg max-w-md w-full mx-auto shadow-xl transform transition-all duration-300 ease-out opacity-0 scale-95",
                afterOpen: "opacity-100 scale-100",
                beforeClose: "opacity-0 scale-90"
            },
            ariaHideApp: false,
            ...modal.props.modalOptions
        };

        switch (modal.type) {
            case 'login':
                return (
                    <Modal {...common}>
                        <LoginForm
                            onSuccess={closeModal}
                            toRegister={() => {
                                closeModal;
                                openModal('register');
                            }}
                        />
                    </Modal>
                )

            case 'register':
                return (
                    <Modal {...common}>
                        <RegisterForm
                            onSuccess={closeModal}
                            toLogin={() => {
                                closeModal;
                                openModal('login');
                            }}
                        />
                    </Modal>
                )

            case 'uploadrom':
                return (
                    <Modal {...common}>
                        <RomList onSuccess={closeModal} />
                    </Modal>
                )

            case 'loadroms':
                return (
                    <Modal {...common}>
                        <UserRoms onSuccess={closeModal} />
                    </Modal>
                )

            case 'profile':
                return (
                    <Modal {...common}>
                        <Profile onSuccess={closeModal} />
                    </Modal>
                )

            case 'settings':
                return (
                    <Modal {...common}>
                        <Settings onSuccess={closeModal} />
                    </Modal>
                )

            default:
                return null;
        }


    };

    return (
        <ModalContext.Provider value={{ openModal, closeModal }}>
            {children}
            {renderModal()}
        </ModalContext.Provider>
    )
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) return;
    return context;
}