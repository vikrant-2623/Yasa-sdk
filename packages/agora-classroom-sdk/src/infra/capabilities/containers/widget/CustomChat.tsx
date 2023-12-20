import React, { FC, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import CryptoJS from 'crypto-js';
import axios from 'axios';

export const CustomChat2 = () => {
    const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
    const [newMessage, setNewMessage] = useState<boolean>(false);
    const style = {
        display: 'flex',
        width: '100%',
        height: '100%',
    };
    const openChatBox = () => {
        setIsChatOpen(true);
        if (newMessage) setNewMessage(false);
    };
    const minimizeChatBox = () => {
        setIsChatOpen(false);
        setNewMessage(false);
    };

    // Chat logics

    const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
    const userName = userInfo?.displayName;
    const userUID = userInfo?.uid;
    const userPic = userInfo?.photoURL;
    const idToken = JSON.parse(sessionStorage.getItem('loginToken') || '{}')?.idToken;
    const deviceId = localStorage.getItem('deviceId');
    const langId = JSON.parse(localStorage.getItem('langId') || '{}') || 2;
    const WebSocketURL = 'https://yasa-21022022.uc.r.appspot.com';
    const socket = io(WebSocketURL);
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [chatEvents, setChatEvents] = useState<ChatEvent[]>([]);

    const urlParam = window.location.pathname.split('/');
    const encryptSessionId = urlParam[urlParam.length - 1];
    const sessionId = decryptData(encryptSessionId);
    //   const sessionId = "123";

    // const sessionId = '123';

    const config = {
        headers: {
            authorization: idToken,
            deviceid: deviceId,
            langid: langId,
        },
    };
    const fetchChatBackup = () => {
        const url = 'https://us-central1-yasa-21022022.cloudfunctions.net/GetChatdata';
        const data = {
            ClassID: `S${sessionId}`,
        };
        axios.post(url, data, config).then((res) => {
            setChatEvents(res.data.Data);
        });
    };

    // useEffect(() => {
    //     fetchChatBackup();
    //     function onConnect() {
    //         socket.emit('join', `S${sessionId}`);
    //         setIsConnected(true);
    //     }

    //     function onDisconnect() {
    //         setIsConnected(false);
    //     }

    //     function onChatEvent(
    //         value: string,
    //         person: string,
    //         UserUID: string,
    //         profileIMG: string,
    //         valueDataType: Number,
    //     ) {
    //         if (!isChatOpen || UserUID !== userUID) setNewMessage(true);
    //         const currentTime = new Date().getTime();
    //         const dateObj = new Date(currentTime);
    //         const dateString = dateObj.toLocaleString('en-US', { timeZone: 'UTC' });
    //         setChatEvents((previous: ChatEvent[]) => [
    //             ...previous,
    //             {
    //                 person: person,
    //                 message: value,
    //                 time: dateString,
    //                 UserUID: UserUID,
    //                 UserPic: profileIMG,
    //                 DataType: valueDataType,
    //             },
    //         ]);
    //     }

    //     socket.on('connect', onConnect);
    //     socket.on('disconnect', () => onDisconnect());
    //     socket.on('chat1', onChatEvent);

    //     return () => {
    //         socket.off('connect', onConnect);
    //         socket.off('disconnect', () => onDisconnect());
    //         socket.off('chat1', onChatEvent);
    //     };
    // }, []);
    // End chat logics

    return (
        <>
            <div className="widget-slot-chat h-full">
                <div className="chat-panel ok h-full">
                    <div id="hx-chatroom" style={style}>
                        {isChatOpen && (
                            <ChatBody
                                minimizeChatBox={minimizeChatBox}
                                chatEvents={chatEvents}
                                userUID={userUID}
                                userName={userName}
                                sessionId={sessionId}
                                userPic={userPic}
                                config={config}
                            />
                        )}

                        <div className="fcr-hx-chat" style={{}}>
                            <div
                                className="chat-setting-icon"
                                // className="fcr-hx-show-chat-icon"
                                style={newMessage ? { backgroundColor: '#357bf6' } : {}}
                                onClick={openChatBox}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                                    <path d="M13.9709 13.5594L12.0605 11.9638H3.2017C2.91608 11.9638 2.64216 11.8454 2.4402 11.6347C2.23824 11.424 2.12477 11.1382 2.12477 10.8402V3.53638C2.12477 3.23837 2.23824 2.95256 2.4402 2.74183C2.64216 2.53111 2.91608 2.41272 3.2017 2.41272H12.894C13.1796 2.41272 13.4535 2.53111 13.6555 2.74183C13.8575 2.95256 13.9709 3.23837 13.9709 3.53638V13.5594ZM11.6825 13.0875L14.1734 15.1663C14.2526 15.2322 14.348 15.2735 14.4486 15.2855C14.5493 15.2974 14.6512 15.2794 14.7425 15.2337C14.8339 15.1879 14.911 15.1162 14.965 15.0267C15.019 14.9373 15.0477 14.8338 15.0479 14.728V3.53638C15.0479 2.94036 14.8209 2.36874 14.417 1.94729C14.0131 1.52583 13.4652 1.28906 12.894 1.28906H3.2017C2.63046 1.28906 2.08262 1.52583 1.6787 1.94729C1.27477 2.36874 1.04785 2.94036 1.04785 3.53638V10.8402C1.04785 11.4362 1.27477 12.0078 1.6787 12.4293C2.08262 12.8507 2.63046 13.0875 3.2017 13.0875H11.6825Z" fill="#0D99FF" />
                                    <path d="M10.5479 8.28906H5.54785C5.21452 8.28906 5.04785 8.45573 5.04785 8.78906C5.04785 9.1224 5.21452 9.28906 5.54785 9.28906H10.5479C10.8812 9.28906 11.0479 9.1224 11.0479 8.78906C11.0479 8.45573 10.8812 8.28906 10.5479 8.28906ZM10.5479 5.28906H5.54785C5.21452 5.28906 5.04785 5.45573 5.04785 5.78906C5.04785 6.1224 5.21452 6.28906 5.54785 6.28906H10.5479C10.8812 6.28906 11.0479 6.1224 11.0479 5.78906C11.0479 5.45573 10.8812 5.28906 10.5479 5.28906Z" fill="#0D99FF" />
                                </svg>
                                <p>Chat</p>
                                {/* <svg
                className=""
                width="24"
                height="24"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                data-label="chat">
                <g fill="none">
                    <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M16.7906 19.0332C16.7009 19.0377 16.6107 19.04 16.52 19.04C15.9441 19.04 15.3898 18.9478 14.871 18.7774C12.7625 18.0848 11.24 16.1002 11.24 13.76C11.24 10.8439 13.6039 8.47998 16.52 8.47998C17.1654 8.47998 17.7838 8.59578 18.3554 8.80774C20.3667 9.55345 21.8 11.4893 21.8 13.76C21.8 14.8395 21.476 15.8434 20.92 16.6796V17.8666C20.92 18.5147 20.3947 19.04 19.7467 19.04H16.8585C16.8352 19.04 16.8125 19.0376 16.7906 19.0332Z"
                    fill={newMessage ? '#fff' : '#90949d'}
                    fill-opacity="0.7"></path>
                    <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M17.28 12C17.28 15.8881 14.128 19.04 10.24 19.04C10.1469 19.04 10.0542 19.0382 9.96197 19.0346C9.94234 19.0382 9.92213 19.04 9.90149 19.04H6.13328C5.48527 19.04 4.95995 18.5147 4.95995 17.8667V16.6567C3.86459 15.4156 3.19995 13.7854 3.19995 12C3.19995 8.11194 6.35187 4.96002 10.24 4.96002C14.128 4.96002 17.28 8.11194 17.28 12ZM13.76 13.0605C14.246 13.0605 14.64 12.6665 14.64 12.1805C14.64 11.6945 14.246 11.3005 13.76 11.3005C13.2739 11.3005 12.88 11.6945 12.88 12.1805C12.88 12.6665 13.2739 13.0605 13.76 13.0605ZM11.12 12.1805C11.12 12.6665 10.726 13.0605 10.24 13.0605C9.75394 13.0605 9.35995 12.6665 9.35995 12.1805C9.35995 11.6945 9.75394 11.3005 10.24 11.3005C10.726 11.3005 11.12 11.6945 11.12 12.1805ZM6.71995 13.0605C7.20596 13.0605 7.59995 12.6665 7.59995 12.1805C7.59995 11.6945 7.20596 11.3005 6.71995 11.3005C6.23394 11.3005 5.83995 11.6945 5.83995 12.1805C5.83995 12.6665 6.23394 13.0605 6.71995 13.0605Z"
                    fill={newMessage ? '#fff' : '#90949d'}></path>
                </g>
                </svg> */}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            <ZoomImageContainer />
        </>
    );
};


<svg xmlns="http://www.w3.org/2000/svg" width="7" height="5" viewBox="0 0 7 5" fill="none">
    <path d="M5.54785 3.28906H0.547852C0.214518 3.28906 0.0478516 3.45573 0.0478516 3.78906C0.0478516 4.1224 0.214518 4.28906 0.547852 4.28906H5.54785C5.88118 4.28906 6.04785 4.1224 6.04785 3.78906C6.04785 3.45573 5.88118 3.28906 5.54785 3.28906ZM5.54785 0.289062H0.547852C0.214518 0.289062 0.0478516 0.455729 0.0478516 0.789062C0.0478516 1.1224 0.214518 1.28906 0.547852 1.28906H5.54785C5.88118 1.28906 6.04785 1.1224 6.04785 0.789062C6.04785 0.455729 5.88118 0.289062 5.54785 0.289062Z" fill="#0D99FF" />
</svg>

export interface ChatBodyProps {
    minimizeChatBox: () => void;
    chatEvents: Array<any>;
    userUID: string;
    userName: string;
    sessionId: string;
    userPic: string;
    config: object;
}

interface ChatEvent {
    person: string;
    message: string;
    time: string;
    UserUID: string;
    UserPic: string;
    DataType: Number;
}

const ChatBody: FC<ChatBodyProps> = ({
    minimizeChatBox,
    chatEvents,
    userUID,
    userName,
    sessionId,
    userPic,
    config,
}) => {
    const WebSocketURL = 'https://yasa-21022022.uc.r.appspot.com';
    const socket = io(WebSocketURL);
    const [value, setValue] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [valueDataType, setValueDataType] = useState<Number>(1);

    function onSubmit(event: any) {
        event.preventDefault();
        if (value?.trim() === '') return;
        setIsLoading(true);

        socket
            .timeout(500)
            .emit('chat1', value, userName, `S${sessionId}`, userUID, userPic, valueDataType, () => {
                setIsLoading(false);
            });
        setValue('');
    }

    // custom file attachment
    const inputRef = useRef<HTMLInputElement>(null);
    const attachBtnClick = () => {
        // open file input box on click of another element
        inputRef?.current?.click();
    };

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = () => {
                resolve(fileReader.result as string);
            };
            fileReader.onerror = (error) => {
                reject(error);
            };
        });
    };

    const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        let base64images: string[] = [];
        for (let i = 0; i < e.target.files!.length; i++) {
            const file = e.target.files![i];
            if (file?.name.includes('.png') || file?.name.includes('.jpg')) {
                let base64 = await convertToBase64(file);
                base64 = base64.split(',')[1];
                base64images.push(base64);
            } else {
                alert('Only images can be selecetd');
                break;
            }
        }
        if (base64images.length > 0) {
            setValueDataType(2);
            const url = 'https://us-central1-yasa-21022022.cloudfunctions.net/UploadImages';
            axios.post(url, { img_data: base64images[0] }, config).then((response) => {
                setValue(response.data.Data);
            });
        }
    };

    const handleOnChange = (e: any) => {
        setValueDataType(1);
        setValue(e.target.value);
    };

    return (
        <div className="fcr-hx-app w-full chat-box-wrapper">
            <div>
                <div className="ant-tabs ant-tabs-top chat-widget">
                    <div role="tablist" className="ant-tabs-nav">
                        <div className="ant-tabs-nav-wrap">
                            <div className="ant-tabs-nav-list" style={{ transform: 'translate(0px, 0px)' }}>
                                <div className="ant-tabs-tab ant-tabs-tab-active">
                                    <div
                                        role="tab"
                                        aria-selected="true"
                                        className="ant-tabs-tab-btn"
                                        id="rc-tabs-0-tab-CHAT"
                                        aria-controls="rc-tabs-0-panel-CHAT">
                                        <h3>Chat</h3>
                                    </div>
                                </div>
                                <div
                                    className="ant-tabs-ink-bar ant-tabs-ink-bar-animated"
                                    style={{ left: '0px', width: '49px' }}></div>
                            </div>
                        </div>
                        <div className="ant-tabs-nav-operations ant-tabs-nav-operations-hidden">
                            <button
                                type="button"
                                className="ant-tabs-nav-more"
                                aria-hidden="true"
                                aria-haspopup="listbox"
                                aria-controls="rc-tabs-0-more-popup"
                                id="rc-tabs-0-more"
                                aria-expanded="false"
                                style={{ visibility: 'hidden', order: '1' }}>
                                <span role="img" aria-label="ellipsis" className="anticon anticon-ellipsis">
                                    <svg
                                        viewBox="64 64 896 896"
                                        focusable="false"
                                        data-icon="ellipsis"
                                        width="1em"
                                        height="1em"
                                        fill="currentColor"
                                        aria-hidden="true">
                                        <path d="M176 511a56 56 0 10112 0 56 56 0 10-112 0zm280 0a56 56 0 10112 0 56 56 0 10-112 0zm280 0a56 56 0 10112 0 56 56 0 10-112 0z"></path>
                                    </svg>
                                </span>
                            </button>
                        </div>
                    </div>
                    <div className="ant-tabs-content-holder">
                        <div className="ant-tabs-content ant-tabs-content-top">
                            <div
                                role="tabpanel"
                                aria-hidden="false"
                                className="ant-tabs-tabpane ant-tabs-tabpane-active"
                                id="rc-tabs-0-panel-CHAT"
                                aria-labelledby="rc-tabs-0-tab-CHAT">
                                {chatEvents?.length === 0 ? (
                                    <div
                                        className="fcr-hx-message-box fcr-hx-no-box"
                                        style={{ height: 'calc((100% - 70px) - 158px)' }}>
                                        <div className="fcr-hx-no-msgs">
                                            {/* <img src="/static/noMessage.43e72244..png" /> */}
                                            {/* <svg fill="#aeaeae" height="100px" width="100px" version="1.1" id="Layer_1" 
                                            viewBox="0 0 512 512"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <g> <path d="M458.667,138.688l-64-0.043c-5.888,0-10.667,4.779-10.667,10.667s4.779,10.667,10.667,10.667l64,0.043 c17.643,0,32,14.357,32,32v149.333c0,17.643-14.357,32-32,32h-4.779c-3.925,0-7.509,2.133-9.387,5.589 c-1.877,3.456-1.707,7.637,0.448,10.923c6.165,9.429,13.291,18.389,18.389,24.491c-22.08-4.245-69.205-16.256-93.44-38.229 c-1.963-1.771-4.523-2.752-7.168-2.752H202.667c-11.413,0-22.059-6.165-27.755-16.085c-2.944-5.099-9.451-6.848-14.571-3.925 c-5.099,2.944-6.869,9.451-3.925,14.571c9.493,16.512,27.221,26.773,46.251,26.773h156.096 c39.403,32.64,113.173,42.624,113.813,42.624c9.984,0,18.091-7.893,18.091-17.621c0-4.075-1.472-7.979-4.16-11.136 c-0.192-0.277-0.405-0.512-0.619-0.768c-0.085-0.085-5.867-6.443-12.629-15.147C495.595,386.304,512,365.717,512,341.355V192.021 C512,162.624,488.064,138.688,458.667,138.688z"></path> <path d="M362.667,277.333V128c0-29.397-23.936-53.333-53.333-53.333h-256C23.936,74.667,0,98.603,0,128v149.333 c0,24.341,16.405,44.949,38.741,51.307c-3.797,4.885-7.957,9.899-12.309,14.827c-0.064,0.085-0.149,0.171-0.213,0.256 c-3.157,3.307-4.885,7.531-4.885,11.968c0,9.707,8.128,17.6,18.091,17.6c0.64,0,74.389-9.984,113.792-42.624h156.117 C338.731,330.667,362.667,306.731,362.667,277.333z M149.269,309.333c-2.645,0-5.205,0.981-7.168,2.752 c-24.491,22.187-72.299,34.24-93.504,38.336c5.099-6.08,12.245-15.104,18.453-24.576c2.133-3.285,2.304-7.488,0.448-10.923 s-5.461-5.589-9.387-5.589h-4.779c-17.643,0-32-14.357-32-32V128c0-17.643,14.357-32,32-32h256.021c17.643,0,32,14.357,32,32 v149.333c0,17.643-14.357,32-32,32H149.269z"></path> </g> </g> </g> </g></svg>
                                            */}
                                            <svg width="181" height="145" viewBox="0 0 181 145" opacity={0.8} fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M140.217 35.8392C138.496 35.8392 136.793 35.9876 135.146 36.2471C134.96 23.478 124.595 13.1922 111.804 13.1922C110.008 13.1922 108.268 13.4147 106.602 13.8039C102.03 7.85489 94.848 4 86.7774 4C79.2066 4 72.4503 7.37284 67.8597 12.6732C65.879 12.284 63.8429 12.0803 61.7327 12.0803C46.6836 12.0803 34.0779 22.5513 30.746 36.5991C30.598 36.5991 30.4499 36.5991 30.2833 36.5991C13.5497 36.5991 0 50.1651 0 66.9187C0 83.6724 13.5497 97.2383 30.2833 97.2383C36.3177 97.2383 41.9449 95.4592 46.6651 92.4199C53.477 105.337 67.0082 114.159 82.6311 114.159C98.254 114.159 112.47 104.892 119.097 91.4376C124.706 96.4414 132.11 99.4995 140.217 99.4995C157.765 99.4995 172 85.2477 172 67.6786C172 50.1095 157.765 35.8578 140.217 35.8578V35.8392Z" fill="#EAEAEA"/>
                                                <path d="M55.8914 112.165C55.6269 112.165 55.3651 112.188 55.1119 112.227C55.0835 110.265 53.4904 108.684 51.5246 108.684C51.2487 108.684 50.9812 108.718 50.7252 108.778C50.0225 107.864 48.9187 107.271 47.6784 107.271C46.5148 107.271 45.4765 107.79 44.771 108.604C44.4666 108.545 44.1536 108.513 43.8293 108.513C41.5165 108.513 39.5791 110.123 39.0671 112.282C39.0443 112.282 39.0216 112.282 38.996 112.282C36.4242 112.282 34.3418 114.366 34.3418 116.941C34.3418 119.516 36.4242 121.601 38.996 121.601C39.9234 121.601 40.7882 121.328 41.5136 120.86C42.5605 122.846 44.6401 124.201 47.0411 124.201C49.4422 124.201 51.627 122.777 52.6455 120.71C53.5075 121.479 54.6454 121.949 55.8914 121.949C58.5883 121.949 60.776 119.758 60.776 117.058C60.776 114.358 58.5883 112.168 55.8914 112.168V112.165Z" fill="#EAEAEA"/>
                                                <path d="M171.723 8.00403C171.29 8.00403 170.866 8.04128 170.452 8.10651C170.406 4.89652 167.795 2.31086 164.585 2.31086C164.133 2.31086 163.696 2.36674 163.272 2.46458C162.123 0.969071 160.322 0 158.289 0C156.385 0 154.687 0.847946 153.533 2.18039C153.035 2.08256 152.518 2.03128 151.997 2.03128C148.214 2.03128 145.041 4.65889 144.208 8.195C144.17 8.195 144.133 8.195 144.091 8.195C139.885 8.195 136.479 11.61 136.479 15.817C136.479 20.024 139.885 23.439 144.091 23.439C145.608 23.439 147.023 22.9917 148.21 22.2277C149.922 25.4749 153.324 27.6926 157.246 27.6926C161.169 27.6926 164.747 25.3631 166.413 21.9807C167.823 23.2386 169.685 24.0027 171.723 24.0027C176.139 24.0027 179.712 20.42 179.712 16.0033C179.712 11.5867 176.139 8.00403 171.723 8.00403ZM158.298 4.99433C157.391 4.99433 156.655 4.25827 156.655 3.34978C156.655 2.4413 157.391 1.70518 158.298 1.70518C159.205 1.70518 159.945 2.4413 159.945 3.34978C159.945 4.25827 159.21 4.99433 158.298 4.99433Z" fill="#E6EFF8"/>
                                                <path d="M172.34 8.31256C171.908 8.31256 171.479 8.34988 171.065 8.4151C171.019 5.20511 168.413 2.61939 165.197 2.61939C164.746 2.61939 164.309 2.67534 163.89 2.77317C162.741 1.27766 160.935 0.308594 158.906 0.308594C157.003 0.308594 155.305 1.15648 154.15 2.48893C153.653 2.39109 153.141 2.33987 152.61 2.33987C148.827 2.33987 145.658 4.97214 144.821 8.50359C144.783 8.50359 144.746 8.50359 144.704 8.50359C140.498 8.50359 137.091 11.9139 137.091 16.1256C137.091 20.3372 140.498 23.7475 144.704 23.7475C146.221 23.7475 147.636 23.3003 148.822 22.5362C150.535 25.7835 153.936 28.0011 157.864 28.0011C161.791 28.0011 165.365 25.6716 167.031 22.2893C168.441 23.5472 170.302 24.3159 172.34 24.3159C176.752 24.3159 180.33 20.7332 180.33 16.3166C180.33 11.8999 176.752 8.31723 172.34 8.31723V8.31256Z" fill="#EAEAEA"/>
                                                <circle cx="54.2993" cy="46.761" r="5.80201" fill="white"/>
                                                <circle cx="80.1842" cy="44.9758" r="5.80201" fill="white"/>
                                                <circle cx="101.607" cy="80.6809" r="5.80201" fill="white"/>
                                                <circle cx="123.031" cy="81.5735" r="5.80201" fill="white"/>
                                                <path d="M70.299 77.9393C71.3373 72.633 74.0986 67.8181 78.154 64.2421C81.6837 61.1131 85.8198 58.7443 90.3047 57.2831C94.7896 55.8219 99.5273 55.2997 104.223 55.7488C104.601 55.782 104.981 55.7235 105.332 55.5782C105.682 55.4329 105.992 55.2051 106.236 54.9142C106.482 54.6277 106.659 54.2881 106.753 53.9219C106.846 53.5558 106.854 53.1729 106.776 52.8032C105.656 47.9345 103.509 43.3614 100.477 39.3903C97.4463 35.4192 93.6012 32.142 89.2001 29.7782C83.5135 26.6164 77.2192 24.701 70.7354 24.1592C64.2515 23.6175 57.7266 24.4618 51.5942 26.6362C43.367 29.4722 36.3418 35.0093 31.6621 42.3462C29.5303 45.7296 28.1014 49.5075 27.4604 53.4548C26.8194 57.4021 26.9794 61.438 27.9309 65.3221C29.9765 73.1754 34.7657 80.0369 41.4317 84.6651C40.3517 87.758 39.3207 90.851 38.3388 93.9439C38.1962 94.4071 38.1939 94.9022 38.3322 95.3667C38.4705 95.8313 38.7432 96.2445 39.116 96.5543C39.4887 96.864 39.9449 97.0565 40.4269 97.1074C40.9089 97.1584 41.3952 97.0655 41.8245 96.8404L49.8759 92.5692L53.5088 90.6055C58.5542 92.114 63.8075 92.8101 69.0716 92.6674C69.4472 92.6423 69.812 92.5312 70.1378 92.3426C70.4636 92.154 70.7416 91.893 70.9504 91.5798C71.1592 91.2666 71.2932 90.9096 71.342 90.5363C71.3907 90.1631 71.353 89.7836 71.2317 89.4272C70.0135 85.7262 69.6937 81.7883 70.299 77.9393ZM75.2083 46.3228C75.35 45.4578 75.7206 44.6464 76.2817 43.973C76.8429 43.2996 77.5741 42.7888 78.3994 42.4935C79.1585 42.2249 79.9719 42.147 80.7682 42.2669C81.5644 42.3868 82.3189 42.7006 82.9652 43.1808C83.6459 43.6936 84.1814 44.3749 84.5189 45.1574C84.8565 45.94 84.9845 46.797 84.8904 47.6441C84.7963 48.4911 84.4833 49.2991 83.9821 49.9885C83.481 50.6779 82.8091 51.2249 82.0324 51.5758C81.3852 51.8707 80.6817 52.0215 79.9704 52.0177C78.8284 52.0256 77.7248 51.6052 76.8775 50.8394C76.2105 50.3132 75.7017 49.613 75.4072 48.8161C75.1126 48.0191 75.0438 47.1564 75.2083 46.3228ZM58.9092 48.3847C58.6919 49.1603 58.2872 49.8704 57.7307 50.4526C57.1742 51.0348 56.483 51.4711 55.7181 51.7231C55.1985 51.9118 54.6507 52.0114 54.098 52.0177C52.9801 52.0224 51.8985 51.6212 51.0542 50.8885C50.3947 50.3433 49.8892 49.6351 49.5878 48.8342C49.2864 48.0333 49.1995 47.1676 49.3359 46.3228C49.4297 45.6546 49.6602 45.0129 50.0131 44.4378C50.3659 43.8626 50.8336 43.3664 51.3868 42.9801C51.94 42.5938 52.5669 42.3257 53.2284 42.1924C53.8898 42.0592 54.5717 42.0638 55.2313 42.2059C55.8909 42.3479 56.5142 42.6245 57.0622 43.0182C57.6101 43.4119 58.0711 43.9143 58.4162 44.4941C58.7613 45.074 58.9832 45.7187 59.068 46.3881C59.1529 47.0575 59.0988 47.7372 58.9092 48.3847Z" fill="#005DB8"/>
                                                <path d="M142.659 81.1809C139.681 74.7604 134.584 69.5599 128.225 66.4528C122.795 63.7239 116.801 62.3027 110.723 62.3027C104.646 62.3027 98.6521 63.7239 93.2214 66.4528C89.2974 68.3523 85.844 71.099 83.1103 74.495C80.3766 77.8909 78.4307 81.8512 77.4131 86.0903C75.9788 92.5501 77.1238 99.3146 80.6042 104.942C83.1709 108.918 86.541 112.313 90.4979 114.909C94.4548 117.504 98.9111 119.243 103.58 120.014C109.891 121.158 116.381 120.804 122.53 118.983C124.213 119.779 125.852 120.664 127.44 121.634C128.864 122.42 130.287 123.254 131.76 123.942C132.116 124.02 132.484 124.02 132.84 123.942C133.221 123.942 133.597 123.853 133.938 123.683C134.279 123.512 134.575 123.265 134.804 122.96C135.033 122.655 135.187 122.301 135.255 121.926C135.323 121.551 135.303 121.166 135.197 120.8C134.444 118.312 133.658 115.841 132.84 113.387C136.554 110.637 139.593 107.077 141.726 102.979C143.493 99.6432 144.493 95.9559 144.654 92.1851C144.815 88.4143 144.134 84.655 142.659 81.1809ZM106.035 84.1757C105.818 84.9512 105.413 85.6613 104.856 86.2435C104.3 86.8257 103.609 87.262 102.844 87.5141C102.324 87.7028 101.776 87.8023 101.224 87.8086C100.106 87.8133 99.0242 87.4121 98.1799 86.6795C97.5204 86.1342 97.0149 85.426 96.7135 84.6251C96.4121 83.8242 96.3252 82.9585 96.4616 82.1137C96.5554 81.4455 96.7859 80.8038 97.1388 80.2287C97.4916 79.6536 97.9593 79.1574 98.5125 78.771C99.0657 78.3847 99.6926 78.1166 100.354 77.9834C101.016 77.8502 101.697 77.8547 102.357 77.9968C103.017 78.1389 103.64 78.4154 104.188 78.8091C104.736 79.2028 105.197 79.7053 105.542 80.2851C105.887 80.8649 106.109 81.5096 106.194 82.179C106.279 82.8484 106.224 83.5281 106.035 84.1757ZM126.703 84.1757C126.486 84.9512 126.081 85.6613 125.525 86.2435C124.968 86.8257 124.277 87.262 123.512 87.5141C122.993 87.7028 122.445 87.8023 121.892 87.8086C120.774 87.8133 119.693 87.4121 118.848 86.6795C118.189 86.1342 117.683 85.426 117.382 84.6251C117.081 83.8242 116.994 82.9585 117.13 82.1137C117.224 81.4455 117.454 80.8038 117.807 80.2287C118.16 79.6536 118.628 79.1574 119.181 78.771C119.734 78.3847 120.361 78.1166 121.023 77.9834C121.684 77.8502 122.366 77.8547 123.026 77.9968C123.685 78.1389 124.308 78.4154 124.856 78.8091C125.404 79.2028 125.865 79.7053 126.21 80.2851C126.556 80.8649 126.777 81.5096 126.862 82.179C126.947 82.8484 126.893 83.5281 126.703 84.1757Z" fill="#EB0029"/>
                                                <path d="M104.682 103.506C110.339 101.876 113.475 102.111 118.643 104.975" stroke="white" stroke-width="1.33892" stroke-linecap="round"/>
                                                <path d="M58.0626 71.0741C57.7126 71.1932 57.5254 71.5735 57.6446 71.9236C57.7637 72.2736 58.144 72.4607 58.494 72.3416L58.0626 71.0741ZM58.494 72.3416C61.2459 71.405 63.332 70.9814 65.3544 71.0861C67.3733 71.1907 69.3912 71.8251 71.9976 73.111L72.59 71.9103C69.8976 70.582 67.6943 69.8666 65.4236 69.749C63.1562 69.6316 60.884 70.1138 58.0626 71.0741L58.494 72.3416Z" fill="white"/>
                                            </svg>

                                            <span className="fcr-hx-no-msgs-text">No Message</span>
                                        </div>
                                    </div>
                                ) : (
                                    <ChatBox events={chatEvents} userUID={userUID} />
                                )}
                                <div className="fcr-hx-input-box chat-action-wrapper">
                                    <form onSubmit={onSubmit} className='chat-actions'>
                                        <input
                                            type='text'
                                            placeholder="Please message..."
                                            value={value}
                                            className="ant-input fcr-hx-input-chat"
                                            onChange={handleOnChange} />
                                        <input
                                            style={{ display: 'none' }}
                                            multiple
                                            ref={inputRef}
                                            type="file"
                                            onChange={handleFileInput}
                                        />
                                        <button
                                            className="fcr-btn fcr-btn-sm fcr-btn-primary select-file-btn fcr-hx-attach-btn"
                                            onClick={attachBtnClick}>
                                            <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#858585">
                                                <path d="M7 6H16.75C19.6495 6 22 8.35051 22 11.25C22 14.1495 19.6495 16.5 16.75 16.5H5.5C3.567 16.5 2 14.933 2 13C2 11.067 3.567 9.5 5.5 9.5H16.75C17.7165 9.5 18.5 10.2835 18.5 11.25C18.5 12.2165 17.7165 13 16.75 13H7" stroke="#858585" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                            </svg>
                                        </button>
                                        <button
                                            className="fcr-btn fcr-btn-sm fcr-btn-primary fcr-hx-send-btn"
                                            disabled={isLoading}>
                                            <div className="ripple"></div>
                                            {/* <span style={{ position: 'relative', zIndex: '1' }}>Send</span> */}
                                            <svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#357bf6">
                                                <path d="M13.7612096,12.010246 L3.00114069,10.9260828 L3.00000002,4.07390726 C2.9999013,3.48090338 3.4805459,3.00009873 4.07354978,3.00000001 C4.24030125,2.99997226 4.40476746,3.03878301 4.55391451,3.11335654 L20.4062223,11.0395104 C20.9366211,11.3047098 21.1516077,11.9496696 20.8864083,12.4800684 C20.78252,12.6878448 20.6140494,12.8563254 20.4062791,12.960226 L4.55631145,20.8863826 C4.02592835,21.1516134 3.38095585,20.936665 3.11572505,20.4062819 C3.04118163,20.2572172 3.00236221,20.092846 3.0023401,19.9261816 L3.00143069,13.0735399 L13.7612096,12.010246 Z" />
                                            </svg>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="fcr-hx-mini-icon" onClick={minimizeChatBox}>
                    {/* <img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4NCjxzdmcgd2lkdGg9IjI0cHgiIGhlaWdodD0iMjRweCIgdmlld0JveD0iMCAwIDI0IDI0IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPg0KICAgIDx0aXRsZT7mnIDlsI/ljJY8L3RpdGxlPg0KICAgIDxnIGlkPSJWMi4wLjBfUEPnq6/kvJjljJYiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsUnVsZT0iZXZlbm9kZCI+DQogICAgICAgIDxnIGlkPSLvvIjogIHluIjnq6/vvInlsI/nj63or74t6IGK5aSp5bGV5byALWVsZWN0cm9uIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTIyNi4wMDAwMDAsIC0yMzUuMDAwMDAwKSI+DQogICAgICAgICAgICA8ZyBpZD0i57yW57uELTM3IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg5MjUuMDAwMDAwLCAyMjUuMDAwMDAwKSI+DQogICAgICAgICAgICAgICAgPGcgaWQ9IuacgOWwj+WMliIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMzAxLjAwMDAwMCwgMTAuMDAwMDAwKSI+DQogICAgICAgICAgICAgICAgICAgIDxyZWN0IGlkPSLnn6nlvaIiIHg9IjAiIHk9IjAiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PC9yZWN0Pg0KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTcuMzEyNTY2NCwxMi4xNTg1MTEyIEMxNy41NDY3MTg1LDEyLjM5MjY2MzMgMTcuNTQ2NzE4NSwxMi43NzIyOTg5IDE3LjMxMjU2NjQsMTMuMDA2NDUxIEwxMi40ODIwMDg0LDE3LjgzNzAwOSBDMTIuMzQ3ODcyNywxNy45NzExNDQ3IDEyLjE2NTk5NDQsMTguMDI4NDM5OCAxMS45OTEwNzI4LDE4LjAwODg5NDQgQzExLjgxMzgyMjEsMTguMDMwMjk2NiAxMS42MjgzNjg4LDE3Ljk3MzI3MTYgMTEuNDkyMTMxNiwxNy44MzcwMzQ0IEw2LjY4NzcyNzczLDEzLjAzMjYzMDYgQzYuNDUzNDEzMTUsMTIuNzk4MzE2IDYuNDUzNDEzMTUsMTIuNDE4NDE3IDYuNjg3NzI3NzMsMTIuMTg0MTAyNCBMNi42OTA5NzQyNiwxMi4xODA4NTU5IEM2LjkyNTI4ODg0LDExLjk0NjU0MTMgNy4zMDUxODc4MiwxMS45NDY1NDEzIDcuNTM5NTAyNCwxMi4xODA4NTU5IEwxMS45OTAzMjE1LDE2LjYzMjUxMTIgTDE2LjQ2NDYyNjYsMTIuMTU4NTExMiBDMTYuNjk4Nzc4NywxMS45MjQzNTkxIDE3LjA3ODQxNDMsMTEuOTI0MzU5MSAxNy4zMTI1NjY0LDEyLjE1ODUxMTIgWiBNMTcuMzEyNTY2NCw2LjE2MjY3MTQgQzE3LjU0NjcxODUsNi4zOTY4MjM1MSAxNy41NDY3MTg1LDYuNzc2NDU5MDkgMTcuMzEyNTY2NCw3LjAxMDYxMTIgTDEyLjQ4MjAwODQsMTEuODQxMTY5MiBDMTIuMzQ3ODcyNywxMS45NzUzMDQ5IDEyLjE2NTk5NDQsMTIuMDMyNiAxMS45OTEwNzI4LDEyLjAxMzA1NDUgQzExLjgxMzgyMjEsMTIuMDM0NDU2OCAxMS42MjgzNjg4LDExLjk3NzQzMTggMTEuNDkyMTMxNiwxMS44NDExOTQ2IEw2LjY4NzcyNzczLDcuMDM2NzkwNzQgQzYuNDUzNDEzMTUsNi44MDI0NzYxNiA2LjQ1MzQxMzE1LDYuNDIyNTc3MTcgNi42ODc3Mjc3Myw2LjE4ODI2MjYgTDYuNjkwOTc0MjYsNi4xODUwMTYwNyBDNi45MjUyODg4NCw1Ljk1MDcwMTQ5IDcuMzA1MTg3ODIsNS45NTA3MDE0OSA3LjUzOTUwMjQsNi4xODUwMTYwNyBMMTEuOTkwMzIxNSwxMC42MzY2NzE0IEwxNi40NjQ2MjY2LDYuMTYyNjcxNCBDMTYuNjk4Nzc4Nyw1LjkyODUxOTI5IDE3LjA3ODQxNDMsNS45Mjg1MTkyOSAxNy4zMTI1NjY0LDYuMTYyNjcxNCBaIiBpZD0i5b2i54q257uT5ZCIIiBmaWxsPSIjN0I4OEEwIj48L3BhdGg+DQogICAgICAgICAgICAgICAgPC9nPg0KICAgICAgICAgICAgPC9nPg0KICAgICAgICA8L2c+DQogICAgPC9nPg0KPC9zdmc+" /> */}
                    &times;
                </div>
            </div>
        </div>
    );
};

export interface ChatBoxProps {
    events: Array<any>;
    userUID: string;
}

const ChatBox: FC<ChatBoxProps> = ({ events, userUID }) => {
    useEffect(() => {
        const customChatBox = document.getElementById('custom-chat-box');
        if (customChatBox) customChatBox.scrollTo(0, customChatBox.scrollHeight);
    }, [events]);
    return (
        <div
            id="custom-chat-box"
            className="fcr-hx-message-box"
            style={{ height: 'calc((100% - 70px) - 158px)', padding: '0 10px' }}>
            {events?.map((event: any) => {
                const currentUser = userUID === event.UserUID;
                const isImage = event?.DataType === 2;
                return (
                    <div className={`chat-event ${currentUser ? 'current-user' : 'other-user'}`}>
                        <div className="sender-name">{event.person}</div>
                        {isImage ? (
                            <div className="event-image">
                                <img
                                    style={{ maxWidth: '200px' }}
                                    src={event.message}
                                    onClick={() => openImage(event.message)}
                                    alt="picture"
                                />
                            </div>
                        ) : (
                            <div className="event-message">
                                <p>{event.message}</p>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// Function to open the image in a modal
function openImage(imageSrc: string): void {
    const modal = document.getElementById('zoomImageModal')!;
    const modalImage = document.getElementById('modalImage') as HTMLImageElement;
    modal.style.display = 'block';
    modalImage.src = imageSrc;
}

// Function to close the modal
function closeImage(): void {
    const modal = document.getElementById('zoomImageModal')!;
    modal.style.display = 'none';
}

const ZoomImageContainer = () => {
    return (
        <div id="zoomImageModal" className="zoom-image-modal">
            {/* <span className="close" onClick={closeImage}>
        &times;
      </span> */}
            <img className="zoom-image-modal-content" id="modalImage" />
        </div>
    );
};

export const decryptData = (encrypt: string) => {
    const SECRET_KEY = 'mYse&retkEy';
    const encrypted = encrypt.replace(/AGORA/g, '/');
    const decrypted = CryptoJS.AES.decrypt(encrypted, SECRET_KEY).toString(CryptoJS.enc.Utf8);
    return decrypted;
};