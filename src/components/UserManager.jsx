import { useCallback, useEffect, useState } from "react";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

import { db, auth } from "../firebase/firebase";
import "./UserManager.css";


function UserManager() {

  const [users, setUsers] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "editor",
    permissions: {
      manageNews: false,
      manageEvents: false,
      manageGallery: false,
      managePolls: false
    }
  });


  const loadUsers = useCallback(async () => {
    const snapshot = await getDocs(collection(db, "users"));

    setUsers(
      snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }))
    );
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        if (!isMounted) return;

        setUsers(
          snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data()
          }))
        );
      } catch (error) {
        if (!isMounted) return;
        console.error(error);
      }
    };

    void fetchUsers();

    return () => {
      isMounted = false;
    };
  }, [loadUsers]);



  async function createUser() {

    try {

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          form.email,
          form.password
        );


      const uid = userCredential.user.uid;


      await setDoc(
        doc(db, "users", uid),
        {
          name: form.name,
          email: form.email,
          role: form.role,
          permissions: form.permissions
        }
      );


      alert("User created successfully!");


      setForm({
        name:"",
        email:"",
        password:"",
        role:"editor",
        permissions:{
          manageNews:false,
          manageEvents:false,
          manageGallery:false,
          managePolls:false
        }
      });


      await loadUsers();

    } catch(error){

      console.error(error);
      alert("Failed to create user");

    }

  }



  return (

    <div className="user-manager-card">

      <h2>
        Manage Users
      </h2>


      <input
        type="text"
        placeholder="Full Name"
        value={form.name}
        onChange={(e)=>
          setForm({
            ...form,
            name:e.target.value
          })
        }
      />


      <input
        type="email"
        placeholder="Email Address"
        value={form.email}
        onChange={(e)=>
          setForm({
            ...form,
            email:e.target.value
          })
        }
      />


      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e)=>
          setForm({
            ...form,
            password:e.target.value
          })
        }
      />



      <select
        value={form.role}
        onChange={(e)=>
          setForm({
            ...form,
            role:e.target.value
          })
        }
      >

        <option value="editor">
          Editor
        </option>

        <option value="admin">
          Admin
        </option>

      </select>



      <h4 className="permissions-title">
        Permissions
      </h4>



      {
        Object.keys(form.permissions).map((key)=>(

          <label
            className="permission-item"
            key={key}
          >

            <input
              type="checkbox"
              checked={form.permissions[key]}
              onChange={(e)=>

                setForm({

                  ...form,

                  permissions:{
                    ...form.permissions,

                    [key]:e.target.checked
                  }

                })

              }
            />

            {key}

          </label>

        ))
      }



      <button
        className="user-create-btn"
        onClick={createUser}
      >
        Create User
      </button>




      <h3 className="users-title">
        Existing Users
      </h3>



      {
        users.map((user)=>(

          <div
            key={user.id}
            className="user-list-card"
          >

            <h4>
              {user.name}
            </h4>


            <p>
              {user.email}
            </p>


            <p>
              Role: {user.role}
            </p>


          </div>

        ))
      }


    </div>

  );

}


export default UserManager;