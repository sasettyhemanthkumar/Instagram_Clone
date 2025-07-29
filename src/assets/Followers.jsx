import React, { useContext, useEffect, useState } from 'react'
import "../styles/search.css"
import axios from 'axios'
import { loginTokenContext, proDataContext, profileTokenContext } from '../App'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'



const Followers = () => {
    const api = import.meta.env.VITE_API_URL;
    const [allFollowers, setAllFollowers] = useState([])
    const [spinner, setSpinner] = useState(false)
    const [loginToken] = useContext(loginTokenContext)
    const [profileToken] = useContext(profileTokenContext)
    const navigate = useNavigate()
    const [proData, setProData] = useContext(proDataContext)
    const { followers } = useParams()
    const [remSpin, setRemSpin] = useState(false)



    // remove follower function 

    const removeFollowerFunc = async (followerId) => {
        try {
            setRemSpin(followerId)
            const response = await axios.delete(`${api}/follower/delete-follower/${followerId}`)
            if (response) {
                const remaining = allFollowers.filter((item) => item._id !== followerId)
                setAllFollowers(remaining)
                toast.success("Follower removed successfully")
                setRemSpin(false)
            }
        } catch (error) {
            console.error(error);
            setRemSpin(false)
            toast.error("Follower has not removed please try again")
        }
    }


    useEffect(() => {
        //get follower function 
        const getFollowers = async () => {
            setSpinner(true)
            try {
                const response = await axios.get(`${api}/follower/get-followers`)
                if (response) {
                    const data = response.data
                    const filtered = data.filter((item) => item.followerId === followers)
                    console.log(response.data);
                    console.log(filtered);
                    setAllFollowers(filtered)
                    setSpinner(false)
                }
            } catch (error) {
                console.error(error);
                setSpinner(false)
            }
        }
        getFollowers()
    }, [followers])



    // if token is not available it navigate to login page 
    useEffect(() => {
        if (!loginToken || !profileToken) {
            navigate("/login")
        }
    }, [loginToken, navigate, profileToken])


    return (
        <>
            <ToastContainer />
            <div className='home-container'>

                {spinner ? <div className="d-flex justify-content-center align-items-center" id='spinner-in-search'>
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div> : <> <div className='follower-cardin'>
                    <h4 className=''>followers {allFollowers.length}</h4>
                    <hr />
                    {allFollowers.length ? <>  {allFollowers.map((item) => (
                        <div key={item.id} className='d-flex align-items-center justify-content-between text-white ' style={{ marginBottom: "1.2rem" }}  >
                            <Link style={{ textDecoration: "none" }} to={`/${item.profileId}`} className='d-flex align-items-center gap-3 text-white'>
                                <img src={item.profilePic} className='home-profile-img' />
                                <h5 className=''>{item.userName.substring(0, 16)} </h5>
                            </Link>
                            {remSpin === item._id ? <button className="remove-follower-bt" type="button" disabled>
                                <span className="spinner-border spinner-border-sm" aria-hidden="true" style={{marginTop:"0.3rem"}}></span>
                                <span className="visually-hidden" role="status">Loading...</span>
                            </button> : <button onClick={() => removeFollowerFunc(item._id)} className={proData._id === item.followerId ? 'remove-follower-bt' : "d-none"}>Remove</button>}


                        </div>
                    ))}</> : <h6 className='text-center '>No Followers</h6>}
                    {/* spinner  */}
                </div></>}
            </div>
        </>
    )
}

export default Followers