import { useEffect, useState } from 'react';
import Loader from './components/loader';
import styled from 'styled-components';
import logo from './assets/images/logo.png';

function App() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    getData();
    const intervalId = setInterval(() => {
      getData();
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <Loader loading={loading} />
      <MainDiv>
        <header className='flex items-center justify-between pb-3'>
          <img src={logo} alt='logo' width={200} height={70} />
          <Title>{data.user}</Title>
        </header>
        <span>
          <Text>Temperature: </Text>
          <Title>{data.temperature} °C</Title>
        </span>
        <span>
          <Text>Humidity: </Text>
          <Title>{data.humidity} %</Title>
        </span>
        <span>
          <Text>Gas: </Text>
          <Title>{data.gas}</Title>
        </span>
        <span className='mt-5 border-t-2 border-[var(--main-color)] w-2/5'>
          <Title>Status: </Title>
          <Text>{data.status}</Text>
        </span>
      </MainDiv>
    </>
  );
}

export default App;

const MainDiv = styled.div`
min-height: 100vh;
width: 100%;
padding: 1em 2em;
img {
  width: 200px;
  height: 50px;
  object-fit: contain;
}
span {
  display: flex;
  align-items: center;
  padding: 0.5em;
}
`

const Text = styled.p`
font-size: 1.2em;
color: var(--main-color);
font-family: 'IBMPlexSans-Regular';
padding-right: 1em;
min-width: 150px;
`

const Title = styled.p`
font-size: 1.3em;
color: var(--main-color);
font-family: 'IBMPlexSans-SemiBold';
min-width: 150px;
`