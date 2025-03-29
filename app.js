// Import necessary Chakra UI components
const { ChakraProvider, Box, Container, VStack, HStack, Heading, Button, useToast, Spinner } = window['chakra-ui-react'];

function App() {
    const toast = useToast();

    const handleApiCall = () => {
        toast({
            title: "API Call",
            description: "Calling API endpoint...",
            status: "info",
            duration: 5000,
            isClosable: true,
        });
        // Simulate API call
        setTimeout(() => {
            toast({
                title: "API Call Success",
                description: "API endpoint called successfully.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        }, 2000);
    };

    return (
        <ChakraProvider>
            <Container centerContent>
                <VStack spacing={4}>
                    <Heading as="h1" size="xl">My Web App</Heading>
                    <Button onClick={handleApiCall} colorScheme="blue">Call API</Button>
                    <Spinner size="xl" />
                </VStack>
            </Container>
            <Box position="fixed" bottom="0" width="100%" bg="gray.800" color="white" textAlign="center" p={4}>
                Negative Bar and Menu
            </Box>
        </ChakraProvider>
    );
}

// Render the app
const rootElement = document.getElementById('app');
ReactDOM.render(<App />, rootElement);
