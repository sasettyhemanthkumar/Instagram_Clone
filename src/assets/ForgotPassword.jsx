import React, { useContext, useEffect, useState } from 'react'
import "../styles/loginSignUp.css"
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { loginTokenContext, profileTokenContext } from '../App'
import { toast, ToastContainer } from 'react-toastify'


const ForgotPassword = () => {
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

  // signup function 
  const signUpFunc = async (e) => {

    e.preventDefault()
    // expression for checking number in password
    const checkNumber = /[1-9]/
    try {

      // form validation 
      setSpinner(true)
      setError(false)
      setPassErr(false)
      setMailErr(false);
      if (!password || !email) {
        setError(true)
        setPassErr(false)
        setSpinner(false)

      } else if (!checkNumber.test(password)) {
        setPassErr(true)
        setError(false)
        setSpinner(false)
      } else {
        const response = await axios.put(`${api}/user/update-password`, { email, password })
        if (response) {
          setEmail("")
          setPassword("")
          toast.success("password has been changed successfully")
          setLoader(true)
          setSpinner(false)
          setTimeout(() => {
            setLoginToken("")
            localStorage.removeItem("loginToken")
            navigate("/login")
          }, 1000);
        }
      }

    } catch (error) {
      setSpinner(false)
      setLoader(false)
      if (error.response.status === 404) {
        setMailErr(true);

      } if (error.response.status === 500) {
        toast.error("please try again server is down")

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

  return (
    <>
      <ToastContainer />

      <div className='main-signup-card'>
        {loader ? <div id="spinner-card" className="d-flex justify-content-center align-items-center" >
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
          : ""}

        <div className='sign-up-card border-white'>
          <form className='pt-4' onSubmit={signUpFunc}>
            <h5 className='text-center' style={{ fontSize: "23px" }}>Change Password</h5>

            <div className='horizontal-line border-white'></div>

            <h5 className='email-text'>Email</h5>
            <input value={email.trim()} onChange={(e) => setEmail(e.target.value)} type='email' placeholder='Enter Old Email' name='email' className='email-box' />

            {/* validation error  */}
            {error ? <h6 style={{ fontSize: "14px" }} id={email !== "" ? "email-err-hide" : ""} className='text-danger mt-2'>Please Enter the Email</h6> : ""}
            {mailErr ? <h6 style={{ fontSize: "14px" }} className='text-danger mt-2'>Email does not existed use old email</h6> : ""}

            <h5 className='email-text mt-3'>New Password</h5>
            <input value={password.trim()} onChange={(e) => setPassword(e.target.value)} type={hide ? "text" : "password"} placeholder='Create Password' className='email-box' name='password' /><br />

            {/* validation error  */}
            {error ? <h6 style={{ fontSize: "14px" }} className='text-danger mt-2' id={password !== "" ? "password-err-hide" : ""} >Please Enter the Password</h6> : ""}
            {passErr ? <h6 style={{ fontSize: "14px" }} className='text-danger mt-2'>Password must contains at least one<br />number</h6> : ""}

            {/* password toogle div  */}
            <div className='d-flex align-items gap-2 mt-2'>
              <input type='checkbox' onChange={checkEvnet} />
              <span style={{ fontSize: "14px", marginBottom: "0.1rem" }}>{!hide ? "Show Password" : "Hide Password"}</span>
            </div>
            {/* button spinner  */}
            {spinner ? <button className="signup-bt" type="button" disabled="">
              <span className="spinner-border spinner-border-sm" aria-hidden="true" />
              <span className="visually-hidden" role="status">
                Loading...
              </span>
            </button>
              : <button type='submit' className=' signup-bt '>Change Password</button>}



          </form>
        </div>

      </div>
    </>
  )
}

export default ForgotPassword