import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MainScreen() {
  const [textInput] = useState("Lista de 5 preguntas de cultura general de Colombia");
  const [questions, setQuestions] = useState<
    { question: string; options: string[]; correctOption: number }[]
  >([]);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);

  const getIAResponse = async () => {
    setLoading(true);
    const body = {
      contents: [
        {
          parts: [{ text: textInput }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseJsonSchema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              question: { type: "string" },
              options: {
                type: "array",
                items: { type: "string" },
              },
              correctOption: { type: "number" },
            },
          },
        },
      },
    };

    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "x-goog-api-key": process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";

      const parsed = JSON.parse(text);
      setQuestions(parsed);
      setSelectedOptions(Array(parsed.length).fill(-1));
      setCurrentIndex(0);
      setScore(0);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getIAResponse();
  }, []);

  const handleSelect = (optionIndex: number) => {
    const updated = [...selectedOptions];
    const alreadySelected = updated[currentIndex];

    // Solo contar la primera selección por pregunta
    if (alreadySelected === -1) {
      updated[currentIndex] = optionIndex;
      setSelectedOptions(updated);

      if (optionIndex === questions[currentIndex].correctOption) {
        setScore((prev) => prev + 1);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleRestart = () => {
    getIAResponse();
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#ffffff",
        }}
      >
        <ActivityIndicator size="large" color="#111bff" />
        <Text style={{ marginTop: 10, color: "#111bff" }}>
          Cargando preguntas...
        </Text>
      </SafeAreaView>
    );
  }

  if (!questions.length) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#ffffff",
        }}
      >
        <Text>No hay preguntas disponibles</Text>
        <TouchableOpacity
          onPress={handleRestart}
          style={{
            backgroundColor: "#111bff",
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 10,
            marginTop: 20,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            🔄 Generar nuevas preguntas
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentIndex];
  const selected = selectedOptions[currentIndex];

  const isAnswered = selected !== -1;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#ffffff",
        padding: 16,
      }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            textAlign: "center",
            color: "#111bff",
            marginBottom: 12,
          }}
        >
          Trivia de Cultura General 🇨🇴
        </Text>

        <Text
          style={{
            textAlign: "center",
            marginBottom: 20,
            fontSize: 14,
            color: "#555",
          }}
        >
          Pregunta {currentIndex + 1} de {questions.length}
        </Text>

        <View
          style={{
            backgroundColor: "#f9f9ff",
            borderRadius: 16,
            padding: 20,
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 5,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: 17,
              fontWeight: "600",
              marginBottom: 14,
              color: "#333",
            }}
          >
            {currentQuestion.question}
          </Text>

          {currentQuestion.options.map((option, index) => {
            const isSelected = selected === index;
            const isCorrect =
              isAnswered && index === currentQuestion.correctOption;
            const isIncorrect =
              isAnswered && isSelected && index !== currentQuestion.correctOption;

            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleSelect(index)}
                disabled={isAnswered}
                style={{
                  backgroundColor: isCorrect
                    ? "#a0e3a0"
                    : isIncorrect
                    ? "#ffb3b3"
                    : isSelected
                    ? "#e4e9ff"
                    : "#fff",
                  borderWidth: 1,
                  borderColor: isSelected ? "#111bff" : "#ccc",
                  borderRadius: 10,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    color: isSelected ? "#111bff" : "#333",
                  }}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Botones de navegación */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 20,
        }}
      >
        <TouchableOpacity
          onPress={handlePrev}
          disabled={currentIndex === 0}
          style={{
            flex: 1,
            backgroundColor: currentIndex === 0 ? "#ccc" : "#111bff",
            paddingVertical: 14,
            borderRadius: 12,
            marginRight: 8,
          }}
        >
          <Text
            style={{
              textAlign: "center",
              color: "#fff",
              fontWeight: "bold",
            }}
          >
            ⬅️ Anterior
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNext}
          disabled={currentIndex === questions.length - 1}
          style={{
            flex: 1,
            backgroundColor:
              currentIndex === questions.length - 1 ? "#ccc" : "#111bff",
            paddingVertical: 14,
            borderRadius: 12,
            marginLeft: 8,
          }}
        >
          <Text
            style={{
              textAlign: "center",
              color: "#fff",
              fontWeight: "bold",
            }}
          >
            Siguiente ➡️
          </Text>
        </TouchableOpacity>
      </View>

      {/* Mostrar puntaje si llegó al final */}
      {currentIndex === questions.length - 1 && isAnswered && (
        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              textAlign: "center",
              fontSize: 16,
              fontWeight: "bold",
              color: "#111bff",
            }}
          >
            🏆 Tu puntaje: {score} / {questions.length}
          </Text>

          <TouchableOpacity
            onPress={handleRestart}
            style={{
              backgroundColor: "#111bff",
              borderRadius: 12,
              paddingVertical: 14,
              marginTop: 16,
            }}
          >
            <Text
              style={{
                textAlign: "center",
                color: "#fff",
                fontWeight: "bold",
              }}
            >
              🔄 Jugar de nuevo
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
