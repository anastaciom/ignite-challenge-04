import { Component, useEffect } from "react";

import Header from "../../components/Header";
import api from "../../services/api";
import Food from "../../components/Food";
import ModalAddFood from "../../components/ModalAddFood";
import ModalEditFood from "../../components/ModalEditFood";
import { FoodsContainer } from "./styles";
import { useState } from "react";
import { IFood, IFoodOmit } from "../../types/Food";

export default function Dashboard() {
  interface IData {
    foods: IFood[];
    editingFood: IFood;
    modalOpen: boolean;
    editModalOpen: boolean;
  }

  const [data, setData] = useState<IData>({
    foods: [],
    editingFood: {
      available: false,
      description: "",
      id: 0,
      image: "",
      name: "",
      price: "",
    },
    modalOpen: false,
    editModalOpen: false,
  });

  useEffect(() => {
    getAllFoods();
  }, []);

  async function getAllFoods() {
    const response = await api.get("/foods");
    return setData({ ...data, foods: response.data });
  }

  async function handleAddFood(food: IFoodOmit) {
    try {
      const response = await api.post("/foods", {
        ...food,
        available: true,
      });

      setData({ ...data, foods: [...data.foods, response.data] });
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(food: IFoodOmit) {
    try {
      const foodUpdated = await api.put(`/foods/${data.editingFood?.id}`, {
        ...data.editingFood,
        ...food,
      });

      const foodsUpdated = data.foods.map((f) =>
        f.id !== foodUpdated.data.id ? f : foodUpdated.data
      );

      setData({ ...data, foods: foodsUpdated });
    } catch (err) {
      console.log(err);
    }
  }

  async function handleDeleteFood(id: number) {
    await api.delete(`/foods/${id}`);
    const foodsFiltered = data.foods.filter((food) => food.id !== id);
    setData({ ...data, foods: foodsFiltered });
  }

  function toggleModal() {
    return setData({ ...data, modalOpen: !data.modalOpen });
  }

  function toggleEditModal() {
    setData({ ...data, editModalOpen: !data.editModalOpen });
  }

  function handleEditFood(food: any) {
    setData({ ...data, editingFood: food, editModalOpen: true });
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={data.modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={data.editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={data.editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {data.foods &&
          data.foods.map((food) => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
}
