import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginTokenContext, proDataContext, profileTokenContext, refreshContext } from "../App"
import app from "../firebase"
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import "../styles/loginSignUp.css"
import { toast, ToastContainer } from 'react-toastify'


const CreateProfile = () => {
  const api = import.meta.env.VITE_API_URL
  const [fullName, setFullName] = useState("")
  const [userName, setUserName] = useState("")
  const [bio, setBio] = useState("")
  const [image, setImage] = useState("")
  const [error, setError] = useState(false)
  const [userErr, setUserErr] = useState(false)
  const [loader, setLoader] = useState(false)
  const navigate = useNavigate()
  const [spinner, setSpinner] = useState(false)
  const [fileSpinner, setFileSpinner] = useState(false)
  const [loginToken] = useContext(loginTokenContext)
  const [profileToken, setProfileToken] = useContext(profileTokenContext)
  const [proData, setProData] = useContext(proDataContext)
  const [refresh, setRefresh] = useContext(refreshContext)

  // image path name converting to url with firebase 
  const fileFunc = async (e) => {
    const image = e.target.files[0]

    if (image) {
      setFileSpinner(true)
      try {
        const storage = getStorage(app)
        const storageRef = ref(storage, "image/" + image.name)
        await uploadBytes(storageRef, image);
        const downLoadUrl = await getDownloadURL(storageRef)
        setImage(downLoadUrl)
        setFileSpinner(false)

      } catch (error) {
        console.log(error)
        alert("Please try again Profile photo not uploaded ")
      }
    }
  }

  // profile details sending in object 
  const profileData = {
    image: image,
    profileName: fullName,
    userName: userName,
    bio: bio
  }

  // profile creating function 
  const createFunc = async (e) => {
    e.preventDefault()
    try {
      setSpinner(true)
      setUserErr(false)
      setError(false)
      if (!fullName || !bio || !image || !userName) {
        setError(true)
        setSpinner(false)
      } else {
        const response = await axios.post(`${api}/profile/create-profile`, profileData, {
          headers: {
            token: loginToken
          }
        })
        if (response) {
          setLoader(true)
          setSpinner(false)
          setTimeout(() => {
            setProfileToken("profileToken")
            localStorage.setItem("profileToken", JSON.stringify("profilToken"))
            toast.success("Profile has created successfully")
            setRefresh(true)
          }, 1000);
        }

      }
    } catch (error) {
      setSpinner(false)
      console.log(error);
      if (error.response) {
        // if user name exists alredy this condition will excute 
        if (error.response.status === 404) {
          setUserErr(true)
        }
      } else {
        alert("Please wait few Seconds and try Again server is down")
      }

    }
  }


  // if token is not available it navigate to login page 
  useEffect(() => {
    if (!loginToken) {
      return navigate("/login")
    } else if (profileToken) {
      navigate("/")
    }
  }, [loginToken, profileToken, navigate, proData])


  return (
    <>
      <ToastContainer />
      {/* loder  */}
      {loader ? <div style={{ zIndex: "1000" }} id="profile-spin-card" className="d-flex justify-content-center align-items-center"  >
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
        : ""}
      <div id="create-profi-card" className='main-signup-card text-white' >

        <div className='sign-up-card  border-warning'>
          <form className='pt-4' onSubmit={createFunc}>
            <h5 className='text-center' style={{ fontSize: "23px" }}>Create Profile</h5>
            <div className='horizontal-line border-warning'></div>
            <div className='d-flex flex-column align-items-center mb-2' style={{ position: "relative" }}>


              {fileSpinner ? <div className='add-profile-first1'> <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div></div> : <>  {image ? <img src={image} className='add-profile-first' alt='profile-photo' /> : <div className='add-profile-first1'></div>}</>}

              {fileSpinner ? "" : <>{image ? "" : <label htmlFor='file' id='camera-icon'><span style={{ fontSize: "2rem" }} className="material-symbols-outlined">
                add_a_photo
              </span></label>}</>}



              <input type='file' onChange={fileFunc} name="image" id="file" className='d-none' />
              {error ? <h5 id={image !== "" ? "email-err-hide" : ""} className='email-text text-danger'>Add Profile Photo</h5> : <> {image ? "" : <h5 className='email-text text-white'>Add Profile Photo</h5>} </>}

            </div>

            <h5 className='email-text'>Full Name</h5>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} type='text' placeholder='Enter Full Name' name='fullName' className='email-box border-success' />
            {/* validation error  */}
            {error ? <h6 style={{ fontSize: "14px" }} id={fullName !== "" ? "email-err-hide" : ""} className='text-danger mt-2'>Please Enter the Name</h6> : ""}


            <h5 className='email-text mt-3'>User Name</h5>
            <input value={userName.trim()} onChange={(e) => setUserName(e.target.value)} placeholder='Enter UserName' className='email-box border-success' name='userName' /><br />
            {/* validation error  */}
            {error ? <h6 style={{ fontSize: "14px" }} className='text-danger mt-2' id={userName !== "" ? "password-err-hide" : ""} >Please Enter the UserName</h6> : ""}
            {userErr ? <h6 style={{ fontSize: "14px" }} className='text-danger mt-2'>This userName already taken</h6> : ""}

            <h5 className='email-text mt-3'>Bio</h5>
            <input value={bio} onChange={(e) => setBio(e.target.value)} placeholder='Add Your Bio' className='email-box border-success' name='bio' /><br />
            {error ? <h6 style={{ fontSize: "14px" }} id={bio !== "" ? "email-err-hide" : ""} className='text-danger mt-2 mb-0 '>Please Add Your Bio </h6> : ""}


            {/* button spinner  */}
            {spinner ? <button style={{ marginTop: "2rem" }} className="signup-bt bg-warning " type="button" disabled="">
              <span className="spinner-border spinner-border-sm" aria-hidden="true" />
              <span className="visually-hidden" role="status">
                Loading...
              </span>
            </button>
              : <button type='submit' className=' signup-bt bg-warning text-dark' style={{ marginTop: "2rem" }}>Create Profile</button>}<br />

          </form>
        </div>



      </div>
    </>
  )
}

export default CreateProfile