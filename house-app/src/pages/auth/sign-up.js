import { useEffect, useState } from "react";
import connection from "../../signalRService";
import Input, { TextArea } from "../../components/elements/input";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "../../components/styles/form";
import MainLayout from "../../components/layout/main-layout";
import styled from "styled-components";
import { Headline2, MobileSubHeadline1, MobileText, SubHeadline1, Text } from "../../components/typography";
import emailIcon from '../../assets/images/icons/email-icon.svg'
import userIcon from '../../assets/images/icons/user-icon.svg'
import phoneIcon from '../../assets/images/icons/phone-icon.svg'
import addressIcon from '../../assets/images/icons/marker-icon.svg'
import Button from "../../components/elements/buttons";
import StepIndicator from "../../components/elements/step-indicator";
import NumberCounter from "../../components/elements/number-counter";
import infoIcon from '../../assets/images/icons/info-icon.svg'
import { colors } from "../../assets/colors";
import doneImage from '../../assets/images/done-image.svg';
import errorImage from '../../assets/images/error-image.svg';

export default function SignUp() {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [temperature, setTemperature] = useState(22);
    const [humidity, setHumidity] = useState(50);
    const [notes, setNotes] = useState('');

    const [validationErrors, setValidationErrors] = useState({
        username: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        confirmPassword: '',
    });

    const [resultStatus, setResultStatus] = useState(404);

    const [stepCount, setStep] = useState(1);

    const [loaderState, setLoaderState] = useState(false);
    const navigate = useNavigate();


    function getData() {
        setLoading(true);
        fetch('http://192.168.1.104:5213/House/get-last-data').then((res) => {
            return res.json();
        })
            .then((data) => {
                setData(data);
                console.log(data)
            });
        setTimeout(() => { setLoading(false) }, 2000);
    }

    // useEffect(() => {
    //   getData();
    //   const intervalId = setInterval(() => {
    //     getData();
    //   }, 10000);

    //   return () => clearInterval(intervalId);
    // }, []);

    function validateStep1() {
        const errors = {
            username: username.trim() === '' ? 'Ім’я користувача обовʼязкове' : '',
            email: email.trim() === '' ? 'Email обовʼязковий' :
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? 'Невірний формат email' : '',
            phone: phone.trim() === '' ? 'Телефон обовʼязковий' : '',
            address: address.trim() === '' ? 'Адреса обовʼязкова' : '',
            password:
                password.trim() === '' ? 'Пароль обовʼязковий' :
                    password.length < 6 ? 'Пароль має містити щонайменше 6 символів' :
                        !/[a-z]/.test(password) ? 'Пароль має містити хоча б одну маленьку літеру' :
                            !/[A-Z]/.test(password) ? 'Пароль має містити хоча б одну велику літеру' :
                                !/[0-9]/.test(password) ? 'Пароль має містити хоча б одну цифру' :
                                    '',

            confirmPassword: confirmPassword.trim() === '' ? 'Підтвердження паролю обовʼязкове' :
                password.trim() !== confirmPassword.trim() ? 'Паролі не співпадають' : '',
        };

        setValidationErrors(errors);

        return Object.values(errors).every(err => err === '');
    }

    async function register() {
        console.log(email);
        console.log(password);

        // setEmailMessage("");
        // setPasswordMessage("");

        setLoaderState(true);
        try {
            const response = await fetch("http://192.168.1.104:8080/Account/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userName: username,
                    email,
                    address,
                    phone,
                    notes,
                    tempNorma: temperature.toString(),
                    humidNorma: humidity.toString(),
                    password
                }),
            });

            const result = await response.json();
            if (result.status === 200) {
                setResultStatus(200);
                // setEmailMessage(errorText.errors?.Email?.join(". ") || "");
                // setPasswordMessage(errorText.errors?.Password?.join(". ") || "");

            }
            else {
                console.error("Register failed:", result);
                setResultStatus(404);
                return;
            }
            console.log(result);


            // const data = await response.json();
            // if (data.status === 403) {
            //     console.log(data);
            //     return;
            // }

            // navigate('/sign-in');

        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setTimeout(() => setLoaderState(false), 500);
        }
    }

    useEffect(() => {

    }, [email, username, phone, address, password, confirmPassword, temperature, humidity, notes]);

    return (
        <MainLayout loaderState={loaderState}>
            <AuthForm headline={"Створіть свій профіль"} subHeadline={"Будь ласка, вкажіть усю необхідну інформацію для завершення реєстрації користувача"} btnText={"Продовжити"} isSignUp={true}>
                <StepIndicator currentStep={stepCount} setValueStep={setStep} isValidToNext={validateStep1} />
                {stepCount === 1 &&
                    <>
                        <span>
                            <Headline2>Персональна інформація</Headline2>
                            <SubHeadline1 className="!w-full pt-2">Розкажіть трохи про себе – заповніть поля нижче</SubHeadline1>
                        </span>
                        <div className="flex items-center pt-6">
                            <Input name={'username'} value={username} setValue={setUsername} text={"Ім’я користувача"} placeholder="Іваненко" icon={userIcon} messageText={validationErrors.username} messageType={validationErrors.username && "error"} />
                            <Input name={'email'} value={email} setValue={setEmail} text={"Email"} placeholder="ivanenko@gmail.com" icon={emailIcon} messageText={validationErrors.email} messageType={validationErrors.email && "error"} />
                        </div>
                        <div className="flex items-center pt-4">
                            <Input name={'phone'} value={phone} setValue={setPhone} text={"Номер телефону"} placeholder="+38 067 123 7859" icon={phoneIcon} messageText={validationErrors.phone} messageType={validationErrors.phone && "error"} />
                            <Input name={'address'} value={address} setValue={setAddress} text={"Адреса"} placeholder="м. Рівне, вул. Соборна, 11" icon={addressIcon} messageText={validationErrors.address} messageType={validationErrors.address && "error"} />
                        </div>
                        <div className="flex items-center pt-4">
                            <Input name={'password'} value={password} setValue={setPassword} text={"Пароль"} placeholder="******" messageText={validationErrors.password} messageType={validationErrors.password && "error"} />
                            <Input name={'password'} value={confirmPassword} setValue={setConfirmPassword} text={"Підтвердити пароль"} placeholder="******" messageText={validationErrors.confirmPassword} messageType={validationErrors.confirmPassword && "error"} />
                        </div>
                    </>}
                {stepCount === 2 &&
                    <>
                        <span>
                            <Headline2>Налаштування параметрів комфорту</Headline2>
                            <SubHeadline1 className="!w-full pt-2">Вкажіть, які значення температури, вологості чи інших показників для вас є нормальними.</SubHeadline1>
                        </span>
                        <MeasuresBlock className="w-full flex flex-wrap justify-between py-6 gap-8">
                            <span className="values-block flex flex-wrap gap-6">
                                <span className="flex flex-wrap justify-between w-full gap-6 md:gap-4 sm:gap-10">
                                    <NumberCounter name={'temperature'} text={"Температура"} value={temperature} setValue={setTemperature} measureUnit={'*C'} index={1} maxValue={45} />
                                    <NumberCounter name={'humidity'} text={"Вологість"} value={humidity} setValue={setHumidity} measureUnit={'%'} index={10} maxValue={120} />
                                </span>
                                <TextArea text={"Нотатки"} placeholder={"Уточнення, деталі по будинку і т.д. "} value={notes} setValue={setNotes} />
                            </span>
                            <InfoText>
                                <span className="flex items-center gap-3 *:!pb-0 pb-2">
                                    <img src={infoIcon} alt="info icon" />
                                    <SubHeadline1>Інформація</SubHeadline1>
                                </span>
                                <Text>
                                    Безпекові параметри, такі як концентрація газу, диму чи наявність вогню, визначаються системою відповідно до загальноприйнятих норм. Вам не потрібно вказувати ці значення — система сповістить вас, якщо буде зафіксовано небезпеку.
                                </Text>
                            </InfoText>
                        </MeasuresBlock>
                    </>}
                {stepCount === 3 &&
                    <ThirdStepBlock className="w-full flex flex-col items-center">
                        <img src={(resultStatus === 200) ? doneImage : errorImage} alt="status-image" />
                        <Headline2>{(resultStatus === 200) ? "Готово! Ваш профіль створено." : "Щось пішло не так!"}</Headline2>
                        <SubHeadline1>{(resultStatus === 200) ? "Увійдіть до системи, щоб почати користування." : "Спробуйте ще раз."}</SubHeadline1>
                    </ThirdStepBlock>
                }
                {stepCount !== 3 && <span className={`w-full flex justify-between pt-6`}>
                    <Button variant={'outline'} intent={'save'} disabled={stepCount === 1} onClick={() => setStep(stepCount - 1)}>Назад</Button>
                    <Button intent={'save'} onClick={() => {
                        if (validateStep1() || stepCount === 2) {
                            if (stepCount === 1) {
                                console.log(username);
                                console.log(email);
                                console.log(phone);
                                console.log(address);
                                console.log(password);
                                console.log(confirmPassword);
                            }
                            if (stepCount === 2) {
                                console.log(temperature);
                                console.log(humidity);
                                console.log(notes);

                                register();
                            }

                            setStep(stepCount + 1);

                        }
                    }}>{stepCount === 2 ? "Зберегти" : "Далі"}</Button>
                </span>}
            </AuthForm>
        </MainLayout>
    )
}

const ThirdStepBlock = styled.span`
img {
    width: 120px;
    height: 100px;
    margin-bottom: 24px;
}
p {
    padding: 5px;
    text-align: center;
}
@media (max-width: 630px) {
    img {
        width: 110px;
        height: 90px;
    }
}

`

const InfoText = styled.span`
width: 30%;

${Text} {
    color: ${colors.main};
}

@media (max-width: 630px) {
    ${SubHeadline1} {
        ${MobileSubHeadline1.componentStyle.rules.join('')};
    }
    ${Text} {
        ${MobileText.componentStyle.rules.join('')};
    }
}
`

const MeasuresBlock = styled.span`
.values-block {
    width: 62%;
}

@media (max-width: 730px) {
    gap: 24px;
.values-block {
    width: 85%;
}
${InfoText} {
    width: 100%;
}
 }

 @media (max-width: 595px) {
    .values-block {
        width: 90%;
    }
 }
`
