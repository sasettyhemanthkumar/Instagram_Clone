import React, { useContext, useEffect, useState } from 'react'
import "../styles/search.css"
import axios from 'axios'
import { loginTokenContext, proDataContext, profileTokenContext } from '../App'
import { Link, useNavigate } from 'react-router-dom'
import ProgressSpinner from './ProgressSpinner'


const Search = () => {
  const api = import.meta.env.VITE_API_URL;
  const [profileData, setProfileData] = useState([])
  const [spinner, setSpinner] = useState(false)
  const [loginToken] = useContext(loginTokenContext)
  const [profileToken] = useContext(profileTokenContext)
  const navigate = useNavigate()
  const [filtered, setFiltered] = useState([])
  const [text, setText] = useState("")
  const [proData , setProData] = useContext(proDataContext)

   

  // fetching all profiles 

  useEffect(() => {

    const getAllProfiles = async () => {
      try {
        const response = await axios.get(`${api}/profile/get-all-profiles`)
        if (response) {
          setProfileData(response.data)
        }
      } catch (error) {
        console.error(error);

      }
    }

    getAllProfiles()

  }, [loginToken, profileToken])

  // search function 
  const searchFunc = (event) => {
    const user = event.target.value
    setSpinner(true)
    setText(user)
    const filteredUsers = profileData.filter((item) => item.userName.toLowerCase().includes(text.toLowerCase()))
    setFiltered(filteredUsers)
  }

  // if token is not available it navigate to login page 
  useEffect(() => {
    if (!loginToken) {
      navigate("/login")
    }
  }, [loginToken, navigate, profileToken])


  return (
    <div className='home-container mt-0'>
      {/* search card */}
      <div className='search-card'>
        <div className='search-card' style={{ position: "relative" }}>
          <input onClick={() => setSpinner(false)} value={text} onChange={searchFunc} type='text' placeholder='Search' className='search-input-box' />
          <span className="material-symbols-outlined search-icon-in-search">
            search
          </span>
        </div>
      </div>
      {/* search results  */}
      {profileData.length ? <> <div className='users-results-card'>

        {spinner ? <>  {filtered.map((item) => (
          <Link to={`/${item._id}`} key={item.id} className='d-flex align-items-center gap-3 text-white ' style={{ textDecoration: "none" }}>
            <img src={item.image} className='home-profile-img' />
            <h5 className=''>{item.userName}</h5>
          </Link>
        ))}</> : <>  {profileData.map((item) => (
          <Link to={`/${item._id}`} key={item.id} className='d-flex align-items-center gap-3 text-white ' style={{ textDecoration: "none" }}>
            <img src={item.image} className='home-profile-img' />
            <h5 className=''>{item.userName}</h5>
          </Link>
        ))}</>}
        {/* spinner  */}
      </div></> : <><div className="d-flex justify-content-center align-items-center" id='spinner-in-search'>
        <ProgressSpinner/>
      </div></>}


    </div>
  )
}

export default Search