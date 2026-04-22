import { useState } from "react";
import "./liste.css";
import { FaUser } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";

function Contact() {

    const [search, setSearch] = useState('');

    const [contacts, setContacts] = useState([
        { id: 1, name: "Archange", phone: "0700000001" },
        { id: 2, name: "Kevin", phone: "0700000002" },
        { id: 3, name: "Alice", phone: "0700000003" }
    ]);

    const deleteContact = (id:any) => {
        setContacts(contacts.filter(contact => contact.id !== id));
    };

    const addContact = () => {
        const newContact = {
            id: Date.now(),
            name: "Nouveau",
            phone: "0000000000"
        };

        setContacts([...contacts, newContact]);
    };

    const filtreContact = contacts.filter(contact =>
        contact.name.toLowerCase().includes(search.toLowerCase()) ||
        contact.phone.includes(search)
    );

    return (
        <div className="container">

            <h1 className="title">
                <FaUser /> Liste de Contacts
            </h1>

            <div className="topBar">
                <input
                    className="input"
                    type="text"
                    placeholder="Rechercher..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />

                <button className="button" onClick={addContact}>
                    Ajouter
                </button>
            </div>

            <ul className="list">
                {filtreContact.map(contact => (
                    <li key={contact.id} className="card">

                        <span className="name">{contact.name}</span>
                        <span className="phone">{contact.phone}</span>

                        <button
                            onClick={() => deleteContact(contact.id)}
                            style={{ marginLeft: "10px", cursor: "pointer" }}
                        >
                            <FiTrash2 />
                        </button>

                    </li>
                ))}
            </ul>

        </div>
    );
}

export default Contact;