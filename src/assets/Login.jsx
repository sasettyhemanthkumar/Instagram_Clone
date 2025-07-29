import React, { useContext, useEffect, useState } from 'react'
import "../styles/loginSignUp.css"
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { loginTokenContext, profileTokenContext } from '../App'
import { toast, ToastContainer } from 'react-toastify'

const Login = () => {
  const api = import.meta.env.VITE_API_URL
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [hide, setHide] = useState(false)
  const [error, setError] = useState(false)
  const [passErr, setPassErr] = useState(false)
  const [mailErr, setMailErr] = useState(false)
  const [loader, setLoader] = useState(false)
  const navigate = useNavigate()
  const [spinner, setSpinner] = useState(false)
  const [loginToken, setLoginToken] = useContext(loginTokenContext)
  const [profileToken, setProfileToken] = useContext(profileTokenContext)
  // login function 

  const loginFunc = async (e) => {
    e.preventDefault()
    try {
      setMailErr(false)
      setPassErr(false)
      setError(false)
      setSpinner(true)
      if (!email || !password) {
        setError(true)
        setSpinner(false)
      } else {
        const response = await axios.post(`${api}/user/login-user`, { email, password })
        if (response.status === 200) {
          setEmail("")
          setPassword("")
          setSpinner(false)
          setLoader(true)
          setTimeout(() => {
            setLoginToken(response.data.token)
            localStorage.setItem("loginToken", JSON.stringify(response.data.token))
          }, 1000);
        }
      }
    } catch (error) {
      setSpinner(false)
      if (error.response) {
        if (error.response.status === 404) {
          setMailErr(true)
          toast.error("If you don't have an account please signup.")
        } else if (error.response.status === 401) {
          setPassErr(true)

        }
      } else {
        alert("Please wait few Seconds and try Again server is down")
      }

      console.log(error);
    }

  }

  // password toggle function 
  const checkEvnet = (e) => {
    const checked = e.target.checked
    if (checked) {
      setHide(true)
    } if (!checked) {
      setHide(false)
    }
  }


  useEffect(() => {
    if (loginToken) {
      navigate("/")
    }
  }, [loginToken, navigate, profileToken])

  return (
    // loader function 
    <>
    <ToastContainer/>
     {loader ? <div id="spinner-card" className="d-flex justify-content-center align-items-center"  >
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
      : ""}

      <div className='main-signup-card'>
        <div className='sign-up-card border-success'>
          <form className='pt-4' onSubmit={loginFunc}>
            <h5 className='text-center' style={{ fontSize: "23px" }}>LogIn</h5>
            <h5 className='text-primary text-center' style={{ fontSize: "14px" }}>Connect to the People</h5>
            <div className='horizontal-line border-success'></div>

            <h5 className='email-text'>Email</h5>
            <input value={email.trim()} onChange={(e) => setEmail(e.target.value)} type='email' placeholder='Enter Email' name='email' className='email-box border-success' />
            {/* validation error  */}
            {error ? <h6 style={{ fontSize: "14px" }} id={email !== "" ? "email-err-hide" : ""} className='text-danger mt-2'>Please Enter the Email</h6> : ""}
            {mailErr ? <h6 style={{ fontSize: "14px" }} className='text-danger mt-2'>You have entered incorrect email</h6> : ""}

            <h5 className='email-text mt-3'>Password</h5>
            <input value={password.trim()} onChange={(e) => setPassword(e.target.value)} type={hide ? "text" : "password"} placeholder='Enter Password' className='email-box border-success' name='password' /><br />

            {/* validation error  */}
            {error ? <h6 style={{ fontSize: "14px" }} className='text-danger mt-2' id={password !== "" ? "password-err-hide" : ""} >Please Enter the Password</h6> : ""}
            {passErr ? <h6 style={{ fontSize: "14px" }} className='text-danger mt-2'>You have entered incorrect password</h6> : ""}

            <div className='d-flex align-items gap-2 mt-2'>
              <input type='checkbox' onChange={checkEvnet} />
              <span style={{ fontSize: "14px", marginBottom: "0.1rem" }}>{!hide ? "Show Password" : "Hide Password"}</span>
            </div>
            {/* button spinner  */}
            {spinner ? <button className="signup-bt bg-success text-white" type="button" disabled="">
              <span className="spinner-border spinner-border-sm" aria-hidden="true" />
              <span className="visually-hidden" role="status">
                Loading...
              </span>
            </button>
              : <button type='submit' className=' signup-bt bg-success text-white'>Login</button>}<br />

            <Link to="/forgotpassword" style={{ fontSize: "16px", textDecoration: "none" }} className='mt-2'>Forgot Password</Link>
            <h6 className='mt-2 text-secondary'>Don't Have An account? <Link className='underline' to="/signup" style={{ textDecoration: "none" }} >Signup</Link></h6>
          </form>
        </div>

      </div>
    </>
  )
}

export default Login