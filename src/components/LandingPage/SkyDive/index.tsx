"use client";
import { View } from "@react-three/drei";
import Scene from "./Scene";

export default function SkyDive() {
  return (
    <section className="px-4 first:pt-10 md:px-6 skydive h-screen">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center">
        <h2 className="sr-only">Dive into better health</h2>
        <View className="h-screen w-screen">
          <Scene />
        </View>
      </div>
    </section>
  );
}
