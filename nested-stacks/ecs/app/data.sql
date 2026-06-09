CREATE TABLE Persons (
  PersonID int PRIMARY KEY,
  LastName varchar(255) NOT NULL,
  FirstName varchar(255),
  Address varchar(255),
  City varchar(255)
);

INSERT INTO Persons (PersonID, LastName, FirstName, Address, City)
VALUES (1, 'Smith', 'John', '123 Main St', 'Anytown'),
        (2, 'Doe', 'Jane', '456 Elm St', 'Othertown'),
        (3, 'Brown', 'Charlie', '789 Oak St', 'Sometown');