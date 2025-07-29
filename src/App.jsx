import React, { createContext, useEffect, useState } from 'react'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import NavBar from './assets/NavBar'
import Home from './assets/Home'
import Search from './assets/Search'
import GroupChat from './assets/GroupChat'
import Profile from './assets/Profile'
import Post from './assets/Post'
import Login from './assets/Login'
import Signup from './assets/Signup'
import CreateProfile from './assets/CreateProfile'
import ForgotPassword from './assets/ForgotPassword'
import axios from 'axios'
import OthersProfile from './assets/OthersProfile'
import 'react-toastify/dist/ReactToastify.css';
import AllGroups from './assets/AllGroups'
import PersonalChat from './assets/PersonalChat'
import Followers from './assets/Followers'
import Followings from './assets/Followings'




export const refreshContext = createContext()
export const profileTokenContext = createContext()
export const loginTokenContext = createContext()
export const proDataContext = createContext()


function App() {
  const api = import.meta.env.VITE_API_URL;
  const [loginToken, setLoginToken] = useState("")
  const [profileToken, setProfileToken] = useState("")
  const [proData, setProData] = useState([])
  const [spinner, setSpinner] = useState(false)
  const [spinner1, setSpinner1] = useState(false)
  const [refresh, setRefresh] = useState("")
  const [user, setUser] = useState([])

  // retrieving token from localStorage 
  useEffect(() => {
    const token = localStorage.getItem("loginToken")
    if (token) {
      setLoginToken(JSON.parse(token))
    }

    // profile token retrieving 
    const proToken = localStorage.getItem("profileToken")
    if (proToken) {
      setProfileToken(JSON.parse(proToken))
    }

  }, [loginToken ,profileToken])

  // get profile function 
  useEffect(() => {
    setSpinner(true)
    setSpinner1(true)
    const getProfile = async () => {

      try {
        const response = await axios.get(`${api}/profile/get-all-profiles`)
        if (response) {
          const data = response.data
          const filtered = data.filter((item) => item.user === user._id)
          if (filtered.length) {
            setProData(filtered[0])
            setProfileToken("profileToken")
            localStorage.setItem("profileToken", JSON.stringify("profilToken"))
            setSpinner(false)
            setSpinner1(false)

          } else if(!filtered.length) {
            setProfileToken("")
          }


        }

      } catch (error) {
        console.log(error);
        setSpinner(false)
        setSpinner1(false)
      }
    }
    if (user) {
      getProfile()
    }

  }, [user, refresh])

  // fetching user id 
  useEffect(() => {

    const getUser = async () => {
      try {
        const response = await axios.get(`${api}/user/get-user`, {
          headers: {
            token: loginToken
          }
        })

        if (response) {
          setUser(response.data)
        }

      } catch (error) {
        console.log(error);
      }
    }
    getUser()

  }, [loginToken])

  return (
    <>
      <refreshContext.Provider value={[refresh, setRefresh]}>
        <proDataContext.Provider value={[proData, setProData]}>
          <profileTokenContext.Provider value={[profileToken, setProfileToken]}>
            <loginTokenContext.Provider value={[loginToken, setLoginToken]}>
              <BrowserRouter>
                <NavBar spinner={spinner} />

                <Routes>
                  <Route path='/' element={<Home />} />
                  <Route path='/search' element={<Search />} />
                  <Route path='/groupchat' element={<GroupChat />} />
                  <Route path='/profile' element={<Profile spinner1={spinner1} />} />
                  <Route path='/post' element={<Post />} />
                  <Route path='/signup' element={<Signup />} />
                  <Route path='/login' element={<Login />} />
                  <Route path='/createprofile' element={<CreateProfile />} />
                  <Route path='/forgotpassword' element={<ForgotPassword />} />
                  <Route path='/:id' element={<OthersProfile />} />
                  <Route path='/allgroups' element={<AllGroups />} />
                  <Route path='/allgroups/:groupId' element={<PersonalChat />} />
                  <Route path='/id/:followers' element={<Followers />} />
                  <Route path='/id/:following' element={<Followings />} />
                  <Route path='/profile/:following' element={<Followings />} />


                </Routes>
              </BrowserRouter>
            </loginTokenContext.Provider>
          </profileTokenContext.Provider>
        </proDataContext.Provider>
      </refreshContext.Provider>
    </>
  )
}

export default App
