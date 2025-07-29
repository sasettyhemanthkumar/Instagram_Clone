import React, { useContext, useEffect, useRef, useState } from 'react'
import "../styles/groupChat.css"
import axios from 'axios'
import { loginTokenContext, proDataContext, profileTokenContext } from '../App';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';

const GroupChat = () => {
  const api = import.meta.env.VITE_API_URL;
  const [data, setData] = useState([])
  const [spinner, setSpinner] = useState(false)
  const [loginToken] = useContext(loginTokenContext)
  const [profileToken] = useContext(profileTokenContext)
  const navigate = useNavigate()
  const [text, setText] = useState("")
  const [proData] = useContext(proDataContext)
  const chatEndRef = useRef(null)
  const [hover, setHover] = useState("")
  const [delSpinner, setDelSpinner] = useState("")

  const fileRef = useRef()

  // this function for focus when user open message it focus on input box 
  useEffect(() => {
    const fileFunc = () => {
      fileRef.current.focus()
    }
    fileFunc()
  }, [])


  // mouseover event 

  const mouseOver = (cardId) => {
    setHover(cardId)
  }

  // scrollBottom automatically when new message comes 
  const scrollBottom = () => {
    if (data.length) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }
  useEffect(() => {
    if (data.length) {
      scrollBottom()
    }
  }, [data])





  // sending text message function 
  const sendText = async (e) => {
    e.preventDefault()
    if (text !== "") {
      try {

        const currentDate = new Date().toLocaleString("en-GB", {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: true
        });

        // sending message object data 
        const chatData = {
          text: text,
          date: currentDate,
          image: proData.image,
          userName: proData.userName,
          userId: proData._id
        }

        setSpinner(true)
        const response = await axios.post(`${api}/chat/send-chat`, chatData)

        if (response) {
          setSpinner(false)
          setText("")
        }

      } catch (error) {
        console.error(error);
        setSpinner(false)
        toast.error("Message has not sent Try again")
      }
    }
    else {
      toast.error("Please Enter message")
    }
  }


  // delete chat function 
  const deleteChat = async (delId) => {
    setDelSpinner(delId)
    try {
      const response = await axios.delete(`${api}/chat/delete-chat/${delId}`)
      if (response) {
        const remainingData = data.filter((item) => item._id !== delId)
        setData(remainingData)
        delSpinner("")
      }
    } catch (error) {
      console.error(error);
      delSpinner("")

    }
  }

  // fetching all messages 

  useEffect(() => {

    const getAllChats = async () => {
      try {
        const response = await axios.get(`${api}/chat/get-all-chats`)
        if (response) {
          setData(response.data)

        }
      } catch (error) {
        console.error(error);
        alert("please wait try again server is down")
      }
    }

    const interval = setInterval(getAllChats, 5000)

    return () => clearInterval(interval)

  }, [])


  // if token is not available it navigate to login page 
  useEffect(() => {
    if (!loginToken || !profileToken) {
      navigate("/login")
    }
  }, [loginToken, navigate, profileToken])

  return (
    <div className='chat-container'>
      <ToastContainer />
      {/* chat inpu box  */}
      <div className='chat-input-card fixed-bottom' >
        <form onSubmit={sendText} className='chat-sub-card'>
          <textarea ref={fileRef} value={text} onChange={(e) => setText(e.target.value)} type='text' className='input-box-in-chat' placeholder='Message...' style={{ borderTopLeftRadius: "5px", borderBottomLeftRadius: "5px" }}></textarea>
          {spinner ? <button className="chat-send-bt text-white" type="button" disabled>
            <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
            <span className="visually-hidden" role="status">Loading...</span>
          </button> : <button type='submit' className='chat-send-bt'>Send</button>}


        </form>
      </div>

      {/* Messages card  */}
      <div className='message-main-card'>
        {/* spinner  */}
        {data.length === 0 ? <><div className="d-flex justify-content-center align-items-center" id='spinner-in-chat'>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div></> :
          // map function 
          <>  {data.map((item) => (
            <div className={proData._id === item.userId ? 'chat-user-card-right' : ""} onMouseOver={() => mouseOver(item._id)}>
              <div key={item._id} className='chat-text-main-card' id={proData._id === item.userId ? "chat-text-main-card1" : ""}>
                <div className='chat-img-user-card'>
                  <Link to={`/${item.userId}`} style={{ textDecoration: "none" }} className='d-flex align-items-center gap-2' >
                    <img src={item.image} className='chat-user-img' alt={item.userName} />
                    <h5 className="user-name-in-chat" >{item.userName}</h5>
                  </Link>
                  {delSpinner === item._id ? <div className='mb-2' style={{ marginTop: "0", paddingTop: "0" }}  >
                    <div className="spinner-grow spinner-grow-sm text-white" style={{ height: "10px", width: "10px" }} role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <div className="spinner-grow spinner-grow-sm mx-1" style={{ height: "10px", width: "10px" }} role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <div className="spinner-grow spinner-grow-sm text-white" style={{ height: "10px", width: "10px" }} role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div></div> : <>  {hover === item._id ? <> {proData._id === item.userId ? <span onClick={() => deleteChat(item._id)} className="material-symbols-outlined delete-icon-in-chat">
                      delete
                    </span> : ""}</> : ""}</>}




                </div>
                <div className='text-card'>
                  <h5 className='chat-text'>{item.text}</h5>
                  <span className='date-in-chat'>{item.date}</span>
                </div>
              </div>
            </div>

          ))}

            <div ref={chatEndRef} id='chat-go-down'></div>
          </>}


      </div>


      <a href='#chat-go-down' className='go-down'><span style={{ fontSize: "27px" }} className="material-symbols-outlined">
        keyboard_double_arrow_down
      </span></a>
    </div>
  )
}

export default GroupChat