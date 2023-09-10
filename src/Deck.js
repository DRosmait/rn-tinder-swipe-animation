import { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  LayoutAnimation,
  UIManager,
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_TRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

export default function Deck({
  data,
  renderCard,
  onSwipeLeft = () => {},
  onSwipeRight = () => {},
}) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  // create animation variable for X and Y positions
  const position = useRef(new Animated.ValueXY(0, 0)).current;

  const onSwipeComplete = (direction) => {
    const cardItem = data[currentCardIndex];

    direction === "right" ? onSwipeRight(cardItem) : onSwipeLeft(cardItem);

    position.setValue({ x: 0, y: 0 });
    setCurrentCardIndex((value) => value + 1);
  };

  // Create PanResponder that takes user interactions on the display
  const panResponder = useRef(
    PanResponder.create({
      // enable PanResponder
      onStartShouldSetPanResponder: () => true,
      // handle user's touch moves
      onPanResponderMove: (_, getsture) => {
        // directly set animation variable to new X and Y positions
        position.setValue({ x: getsture.dx, y: getsture.dy });
      },
      // handle when user release a finger of the display
      onPanResponderRelease: async (_, gesture) => {
        if (gesture.dx > SWIPE_TRESHOLD) {
          await forceSwipeTo("right");
          onSwipeComplete("right");
        } else if (gesture.dx < -SWIPE_TRESHOLD) {
          await forceSwipeTo("left");
          onSwipeComplete("left");
        } else {
          resetPosition();
        }
      },
    })
  );

  const forceSwipeTo = (direction) => {
    let resolver;
    const completePromise = new Promise((resolve) => {
      resolver = resolve;
    });

    // Timing makes linear animation
    // Define timing animation with new X and Y position and start it
    Animated.timing(position, {
      toValue: {
        x: direction === "right" ? SCREEN_WIDTH : -SCREEN_WIDTH,
        y: 0,
      },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(resolver);

    return completePromise;
  };

  const resetPosition = () => {
    // Spring makes bouncing animation
    // Define spring animation to initial position and start it
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  // Update component layout on each new rendering if it has been changed
  useEffect(() => {
    UIManager.setLayoutAnimationEnabledExperimental?.(true);
    LayoutAnimation.spring();
  });

  useEffect(() => {
    setCurrentCardIndex(0);
  }, [data]);

  const getCardStyle = () => {
    // interpolate position.x value to rotation values
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ["-120deg", "0deg", "120deg"],
    });
    return {
      ...position.getLayout(),
      transform: [{ rotate }],
    };
  };

  const renderCards = (list) => {
    return list.map((card, index) => {
      const cardContent = renderCard(card);

      if (index < currentCardIndex) return null;

      const cardItemStyle = StyleSheet.flatten([
        styles.cardItem,
        {
          zIndex: -index,
        },
      ]);

      if (index === currentCardIndex)
        return (
          <Animated.View
            {...panResponder.current.panHandlers}
            style={[getCardStyle(), cardItemStyle]}
            key={card.id}
          >
            {cardContent}
          </Animated.View>
        );

      return (
        <Animated.View
          key={card.id}
          style={[cardItemStyle, { top: 10 * (index - currentCardIndex) }]}
        >
          {cardContent}
        </Animated.View>
      );
    });
  };

  return <View>{renderCards(data)}</View>;
}

const styles = StyleSheet.create({
  cardItem: {
    position: "absolute",
    width: "100%",
  },
});
