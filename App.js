import { ScrollView, StyleSheet, View, PanResponder } from "react-native";
import Deck from "./src/Deck";
import { DATA } from "./seedData";
import { Text, Card, Button, Icon } from "@rneui/themed";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  const renderCard = (item) => {
    return (
      <Card key={item.id}>
        <Card.Title>{item.text}</Card.Title>
        <Card.Divider />
        <Card.Image source={{ uri: item.uri }} />
      </Card>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <Deck renderCard={renderCard} data={DATA} />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
