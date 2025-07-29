import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import "../styles/groupChat.css"
import { loginTokenContext, proDataContext, profileTokenContext } from '../App';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import ProgressSpinner from './ProgressSpinner';


const AllGroups = () => {
    const api = import.meta.env.VITE_API_URL;
    const [groups, setGroups] = useState([])
    const [spinner, setSpinner] = useState(false)
    const [loginToken] = useContext(loginTokenContext)
    const [profileToken] = useContext(profileTokenContext)
    const navigate = useNavigate()
    const [proData] = useContext(proDataContext)
    const [modal, setModal] = useState(false)
    const [delSpinner, setDelSpinner] = useState("")
    const [hover, setHover] = useState("")
    const [formData, setFormData] = useState({
        admin: proData._id,
        groupName: "",
        adminProfileId: proData._id,
        profileId1: "",
        profileId2: "",
        profileId3: "",
        profileId4: "",
        profileId5: "",
        profileId6: "",
        profileId7: "",
        profileId8: "",

    })



  


    // handling multiple inputs function 
    const handleChangeFunc = (event) => {
        const { name, value } = event.target;
        setFormData(prevFormData => ({
            ...prevFormData, [name]: value
        }))
    }

    // create group function 

    const createGroup = async (e) => {
        e.preventDefault()
        try {
            setSpinner(true)
            const response = await axios.post(`${api}/group/create-group`, formData)
            if (response) {
                toast.success("New Group Has been created successfully")
                setModal(false)
                getAllGroups()
                setSpinner(false)
                setFormData({
                    groupName: "",
                    profileId1: "",
                    profileId2: "",
                    profileId3: "",
                    profileId4: "",
                    profileId5: "",
                    profileId6: "",
                    profileId7: "",
                    profileId8: "",
                })
            }
        } catch (err) {
            console.error(err);
            setSpinner(false)
            toast.error("please try again group has not created")
        }
    }

    // get all groups function 
    const getAllGroups = async () => {
        try {
            const response = await axios.get(`${api}/group/get-all-groups`)
            if (response) {
                setGroups(response.data)
            }
        } catch (err) {
            console.error(err);
            toast.error("please try again group has not deletd")
        }
    }


    // delete group function 

    const deleteGroupFunc = async (groupId) => {
        setDelSpinner(groupId)
        try {
            const response = await axios.delete(`${api}/group/delete-group-byid/${groupId}`)
            if (response) {
                toast.success("Group Has deleted successfully")
                setDelSpinner("")
                const filtered = groups.filter((item) => item._id !== groupId)
                setGroups(filtered)
            }
        } catch (err) {
            console.error(err);
            setDelSpinner("")
            toast.success("Group Has not deleted")
        }
    }

    useEffect(() => {
        getAllGroups()
    }, [loginToken, profileToken])




    // mouseover event 

    const mouseOver = (cardId) => {
        setHover(cardId)
    }


    // if token is not available it navigate to login page 
    useEffect(() => {
        if (!loginToken) {
            navigate("/login")
        }
    }, [loginToken, navigate, profileToken])


    return (
        <div className='home-container gap-0' >
            <ToastContainer />

            <h5 className='all-groups-name-top text-warning '>All Groups</h5>

            <div className='all-group-chat-sub-card mt-3'>

                <div className='chat-all-groups-card'  >
                    <Link style={{ textDecoration: "none", color: "white" }} className='d-flex gap-3 align-items-center' to="/groupchat">
                        <span className="material-symbols-outlined text-success" style={{ fontSize: "30px" }}>
                            groups
                        </span>
                        <h5 className='chat-all-group-name text-success'>ChatHub Group</h5>
                    </Link>
                </div>


                {groups.length ? <>  {/* map function  */}
                    {groups.map((item) => {
                        const isItThere = [item.adminProfileId, item.profileId1, item.profileId2, item.profileId3, item.profileId4, item.profileId5, item.profileId6, item.profileId7, item.profileId8].includes(proData._id);
                        return (
                            <div key={item._id} id={isItThere ? "group-show-condition" : "group-hide-condition"} onMouseOver={() => mouseOver(item._id)} onMouseOut={() => setHover("")}>
                                <div className='chat-all-groups-card'   >
                                    <Link style={{ textDecoration: "none", color: "white" }} className='d-flex align-items-center gap-3' to={`/allgroups/${item._id}`}>
                                        <span className="material-symbols-outlined" style={{ fontSize: "30px" }}>
                                            groups
                                        </span>
                                        <h5 className='chat-all-group-name'>{item.groupName}</h5>
                                    </Link>
                                    {delSpinner === item._id ? <> <div className='mb-2' style={{ marginTop: "0", paddingTop: "0" }}  >
                                        <div className="spinner-grow spinner-grow-sm text-white" style={{ height: "10px", width: "10px" }} role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <div className="spinner-grow spinner-grow-sm mx-1" style={{ height: "10px", width: "10px" }} role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <div className="spinner-grow spinner-grow-sm text-white" style={{ height: "10px", width: "10px" }} role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div></div></> : <>  {hover === item._id ? <> {proData._id === item.adminProfileId ? <span onClick={() => deleteGroupFunc(item._id)} className="material-symbols-outlined delete-icon-in-chat" style={{ marginTop: "5px" }}>
                                            delete
                                        </span> : ""}</> : ""}</>}



                                </div>
                            </div>
                        )
                    })}</> : <div className="text-center d-flex align-items-center justify-content-center" style={{ height: "50vh" }}>
                   <ProgressSpinner/>
                </div>}


            </div>

            <div className='create-custom-group' onClick={() => setModal(true)}>
                <span className="material-symbols-outlined">
                    group_add
                </span>
                <h5 className='create-custom-group-text'>New Group</h5>

            </div>


            {/* modal  */}
            {modal ? <div className='modal-create-custom-group'>

                <div className="card bg-dark text-white px-3">
                    <div className='d-flex align-items-center justify-content-between'>
                        <h5 className="card-header">Create New Group</h5>
                        <span onClick={() => setModal(false)} className="material-symbols-outlined" style={{ fontSize: "19px", marginTop: "0.4rem", cursor: "pointer" }}  >
                            close
                        </span>
                    </div>
                    <hr className='m-0 ' />

                    <div className="card-body">
                        <form className='text-dark d-flex flex-column gap-2' onSubmit={createGroup} >
                            <div className="col">
                                <input
                                    required
                                    name='groupName'
                                    value={formData.groupName.trim()}
                                    onChange={handleChangeFunc}
                                    type="text"
                                    className="form-control"
                                    placeholder="Group name"
                                    aria-label="First name"
                                />
                            </div>
                            <div className="col">
                                <input
                                    required
                                    name='profileId1'
                                    value={formData.profileId1.trim()}
                                    onChange={handleChangeFunc}
                                    type="text"
                                    className="form-control"
                                    placeholder="1.Profile Id"
                                    aria-label="First name"
                                />
                            </div>
                            <div className="col">
                                <input
                                    name='profileId2'
                                    value={formData.profileId2.trim()}
                                    onChange={handleChangeFunc}
                                    type="text"
                                    className="form-control"
                                    placeholder="2.Profile Id"
                                    aria-label="First name"
                                />
                            </div>
                            <div className="col">
                                <input
                                    name='profileId3'
                                    value={formData.profileId3.trim()}
                                    onChange={handleChangeFunc}
                                    type="text"
                                    className="form-control"
                                    placeholder="3.Profile Id"
                                    aria-label="First name"
                                />
                            </div>
                            <div className="col">
                                <input
                                    name='profileId4'
                                    type="text"
                                    value={formData.profileId4.trim()}
                                    onChange={handleChangeFunc}
                                    className="form-control"
                                    placeholder="4.Profile Id"
                                    aria-label="First name"
                                />
                            </div>
                            <div className="col">
                                <input
                                    name='profileId5'
                                    value={formData.profileId5.trim()}
                                    onChange={handleChangeFunc}
                                    type="text"
                                    className="form-control"
                                    placeholder="5.Profile Id"
                                    aria-label="First name"
                                />
                            </div>
                            <div className="col">
                                <input
                                    name='profileId6'
                                    value={formData.profileId6.trim()}
                                    onChange={handleChangeFunc}
                                    type="text"
                                    className="form-control"
                                    placeholder="6.Profile Id"
                                    aria-label="First name"
                                />
                            </div>
                            <div className="col">
                                <input
                                    name='profileId7'
                                    value={formData.profileId7.trim()}
                                    onChange={handleChangeFunc}
                                    type="text"
                                    className="form-control"
                                    placeholder="7.Profile Id"
                                    aria-label="First name"
                                />
                            </div>
                            <div className="col">
                                <input
                                    name='profileId8'
                                    type="text"
                                    value={formData.profileId8.trim()}
                                    onChange={handleChangeFunc}
                                    className="form-control"
                                    placeholder="8.Profile Id"
                                    aria-label="First name"
                                />
                            </div>

                            {spinner ? <button className="btn btn-primary mt-2" type="button" disabled>
                                <span className="spinner-border spinner-border-sm" aria-hidden="true" style={{ marginRight: "0.5rem" }}></span>
                                <span role="status">Creating...</span>
                            </button> : <button type='submit' className='btn bg-primary text-white fw-bold mt-2'>Create Group</button>
                            }
                        </form>

                    </div>
                </div>


            </div> : ""}





        </div>
    )
}

export default AllGroups