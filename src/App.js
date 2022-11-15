import { useState, useEffect } from "react";

import phonebook from "./services/phonebook";
import Filter from "./components/Filter";
import PersonForm from "./components/PersonForm";
import Persons from "./components/Persons";
import Notification from "./components/Notification";

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [filter, setFilter] = useState("");
  const [notification, setNotification] = useState({ text: "", error: false });

  useEffect(() => {
    const id = setTimeout(
      () => setNotification({ text: "", error: false }),
      4000
    );

    return () => clearTimeout(id);
  }, [notification]);

  useEffect(() => {
    phonebook.fetch().then((data) => setPersons(data));
  }, []);

  const handleAdd = (event) => {
    event.preventDefault();

    const person = persons.find((person) => person.name === newName);
    if (person) {
      const message =
        `${person.name} is already added to phonebook, replace ` +
        "the old number with a new one?";
      if (window.confirm(message)) {
        phonebook
          .update(person.id, { ...person, number: newNumber })
          .then((returnedPerson) => {
            setPersons(
              persons.map((p) => (person.id !== p.id ? p : returnedPerson))
            );
            setNotification({
              text: `Updated ${returnedPerson.name}`,
              error: false,
            });
            setNewName("");
            setNewNumber("");
          })
          .catch((error) => {
            setNotification({
              text:
                `Information of ${person.name} has already been removed from ` +
                "server",
              error: true,
            });
            setPersons(persons.filter((p) => p.id !== person.id));
          });
      }

      return;
    }

    const newPersonObject = { name: newName, number: newNumber };

    phonebook.add(newPersonObject).then((newPerson) => {
      setPersons(persons.concat(newPerson));
      setNotification({ text: `Added ${newPerson.name}`, error: false });
      setNewName("");
      setNewNumber("");
    });
  };

  const handleDelete = (id) => {
    const person = persons.find((p) => p.id === id);

    if (window.confirm(`Delete ${person.name}?`)) {
      phonebook
        .remove(id)
        .then(() => setPersons(persons.filter((p) => p.id !== id)));
    }
  };

  const personsToShow = filter
    ? persons.filter((person) =>
        person.name.toLowerCase().includes(filter.toLowerCase())
      )
    : persons;

  return (
    <div>
      <h2>Phonebook</h2>

      <Notification message={notification.text} error={notification.error} />
      <Filter {...{ filter, setFilter }} />

      <h3>Add a new</h3>
      <PersonForm
        {...{ newName, newNumber, setNewName, setNewNumber, handleAdd }}
      />

      <h3>Numbers</h3>
      <Persons persons={personsToShow} handleDelete={handleDelete} />
    </div>
  );
};

export default App;
