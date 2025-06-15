import { useEffect, useState } from "react";
import connection from "../../signalRService";
import Input from "../../components/elements/input";
import { useNavigate } from "react-router-dom";
import { AuthForm, SignInForm } from "../../components/styles/form";
import MainLayout from "../../components/layout/main-layout";

import emailIcon from '../../assets/images/icons/email-icon.svg'
import { BodyText1 } from "../../components/typography";
import { colors } from "../../assets/colors";

export default function SignIn() {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [emailMessage, setEmailMessage] = useState('');
    const [password, setPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');

    const [errorMessage, setErrorMessage] = useState('');

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

    async function login() {
        console.log(email);
        console.log(password);
        setErrorMessage("");
        setEmailMessage("");
        setPasswordMessage("");

        setLoaderState(true);
        try {
            const response = await fetch("http://192.168.1.104:8080/Account/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorText = await response.json();
                setEmailMessage(errorText.errors?.Email?.join(". ") || "");
                setPasswordMessage(errorText.errors?.Password?.join(". ") || "");

                console.error("Login failed:", errorText.errors.Password);
                return;
            }


            const data = await response.json();
            if (data.status === 403) {
                console.log(data);
                return;
            }
            console.log("Token:", data.token);

            localStorage.setItem("token", data.token);

            navigate('/user/devices');

        } catch (error) {
            console.error("Fetch error:", error);
            if (error instanceof TypeError) {
                setErrorMessage("Сервер недоступний. Перевірте з’єднання або спробуйте пізніше.");
            } else {
                setErrorMessage(error.message);
            }
        } finally {
            setTimeout(() => setLoaderState(false), 500);
        }
    }


    const startConnection = async () => {
        if (connection.state === "Disconnected") {
            try {
                await connection.start();
                console.log("SignalR connected");

            } catch (err) {
                console.error("SignalR Connection Error: ", err);
            }
        }
    };

    useEffect(() => {

        return () => {
            connection.stop();
        };
    }, []);
    return (
        <MainLayout loaderState={loaderState}>
            <AuthForm headline={"Увійдіть до свого профілю"} subHeadline={"Авторизуйтесь, щоб отримати доступ для входу до системи."} btnText={"Продовжити"} clickFunction={login}>
                <SignInForm className="flex items-center pt-6 mb-3">
                    <Input name={'email'} value={email} setValue={setEmail} text={"Email"} placeholder="ivanenko@gmail.com" icon={emailIcon} messageText={emailMessage} messageType={emailMessage && "error"} />
                    <Input name={'password'} value={password} setValue={setPassword} text={"Пароль"} placeholder="******" messageText={passwordMessage} messageType={passwordMessage && "error"} />
                </SignInForm>
                <BodyText1 className="text-center mb-6" style={{ color: `${colors.error}`, transition: "display 200s ease-in-out" }}>{errorMessage}</BodyText1>
            </AuthForm>
        </MainLayout>
    )
}



// const MainDiv = styled.div`
//     padding-top: 24px;
//     display: flex;
//     flex-direction: column;
//     align-items: center;
// ${Headline1} {
//     color: ${colors.main};
// }
// ${SubHeadline1} {
//     color: ${colors.additional};
//     width: 70%;
//     padding-bottom: 8px;
// }

// @media (max-width: 1335px) {
//     ${SubHeadline1} {
//         width: 80%;
//     }
// }
// @media (max-width: 890px) {
//     ${SubHeadline1} {
//         width: 70%;
//     }
// }
// @media (max-width: 730px) {
// ${Headline1} {
//      ${MobileHeadline1.componentStyle.rules.join('')};
// }
// }

// `

// const MainDiv = styled.div`
// min-height: 100vh;
// width: 100%;
// padding: 1em 2em;
// img {
//   width: 200px;
//   height: 50px;
//   object-fit: contain;
// }
// span {
//   display: flex;
//   align-items: center;
//   padding: 0.5em;
// }
// `

// const Text = styled.p`
// font-size: 1.2em;
// color: var(--main-color);
// font-family: 'IBMPlexSans-Regular';
// padding-right: 1em;
// min-width: 150px;
// `

// const Title = styled.p`
// font-size: 1.3em;
// color: var(--main-color);
// font-family: 'IBMPlexSans-SemiBold';
// min-width: 150px;
// `