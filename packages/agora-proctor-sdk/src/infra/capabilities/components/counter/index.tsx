import { FC, useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';

interface counterProps {
  onFinished?: () => void;
}

export const Counter: FC<counterProps> = ({ onFinished }) => {
  const [counter, setCounter] = useState(5);
  const timeRef = useRef<ReturnType<typeof setInterval>>();
  useEffect(() => {
    timeRef.current = setInterval(() => {
      setCounter((preCounter) => preCounter - 1);
    }, 1000);
    return () => {
      timeRef.current && clearInterval(timeRef.current);
    };
  }, []);

  useEffect(() => {
    if (counter <= 0) {
      timeRef.current && clearInterval(timeRef.current);
      onFinished && onFinished();
    }
  }, [counter]);
  return (
    <Container>
      <Water1 />
      <Water2 />
      <Water3 />
      <Water4 />
      <Content>
        {counter}
        <Tip>考试即将开始</Tip>
      </Content>
    </Container>
  );
};

const Container = styled.div`
  position: relative;
  width: 800px;
  height: 800px;
  margin: 10px auto;
`;
const Water = styled.div`
  padding: 20%;
  position: absolute;
  left: 30%;
  top: 30%;
  border: 1px solid #000;
  border-radius: 100%;
  z-index: 1;
  opacity: 0;
`;

const rotate = keyframes`
  0% {
    -webkit-transform: scale(0.8);
    transform: scale(0.8);
    opacity: 0.9;
  }
  100% {
    -webkit-transform: scale(2);
    transform: scale(2);
    opacity: 0;
  }
`;

const Water1 = styled(Water)`
  animation: ${rotate} 3.2s 2.4s ease-out infinite;
`;
const Water2 = styled(Water)`
  animation: ${rotate} 3.2s 1.6s ease-out infinite;
`;
const Water3 = styled(Water)`
  animation: ${rotate} 3.2s 800ms ease-out infinite;
`;
const Water4 = styled(Water)`
  animation: ${rotate} 3.2s 0s ease-out infinite;
`;

const Content = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  color: #000;
  font-size: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9;
`;
const Tip = styled.div`
  font-size: 24px;
`;
