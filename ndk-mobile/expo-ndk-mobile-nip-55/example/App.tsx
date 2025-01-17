// import { useEvent } from 'expo';
// import ExpoNDKMobileNip55 /*, { ExpoNDKMobileNip55View } */ from 'expo-ndk-mobile-nip-55';
import * as ExpoNDKMobileNip55 /*, { ExpoNDKMobileNip55View } */ from "expo-ndk-mobile-nip-55";
import { /* Button, */ SafeAreaView, ScrollView, Text, View } from "react-native";

export default function App() {
    // const onChangePayload = useEvent(ExpoNDKMobileNip55, 'onChange');

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.container}>
                <Text style={styles.header}>Module API Example</Text>
                {/* <Group name="Constants"> */}
                {/*   <Text>{ExpoNDKMobileNip55.PI}</Text> */}
                {/* </Group> */}
                {/* <Group name="Functions"> */}
                {/*   <Text>{ExpoNDKMobileNip55.hello()}</Text> */}
                {/* </Group> */}
                {/* <Group name="Async functions"> */}
                {/*   <Button */}
                {/*     title="Set value" */}
                {/*     onPress={async () => { */}
                {/*       await ExpoNDKMobileNip55.setValueAsync('Hello from JS!'); */}
                {/*     }} */}
                {/*   /> */}
                {/* </Group> */}
                <Group name="Functions">
                    <Text>{ExpoNDKMobileNip55.getPublicKey()}</Text>
                </Group>
                {/* <Group name="Events"> */}
                {/*   <Text>{onChangePayload?.value}</Text> */}
                {/* </Group> */}
                {/* <Group name="Views"> */}
                {/*   <ExpoNDKMobileNip55View */}
                {/*     url="https://www.example.com" */}
                {/*     // @ts-ignore */}
                {/*     onLoad={({ nativeEvent: { url } }) => console.log(`Loaded: ${url}`)} */}
                {/*     style={styles.view} */}
                {/*   /> */}
                {/* </Group> */}
            </ScrollView>
        </SafeAreaView>
    );
}

function Group(props: { name: string; children: React.ReactNode }) {
    return (
        <View style={styles.group}>
            <Text style={styles.groupHeader}>{props.name}</Text>
            {props.children}
        </View>
    );
}

const styles = {
    header: {
        fontSize: 30,
        margin: 20,
    },
    groupHeader: {
        fontSize: 20,
        marginBottom: 20,
    },
    group: {
        margin: 20,
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
    },
    container: {
        flex: 1,
        backgroundColor: "#eee",
    },
    view: {
        flex: 1,
        height: 200,
    },
};
