const { ChakraProvider, Box, Container, VStack, Heading, Input, Button, useToast, FormControl, FormLabel } = window['chakra-ui-react'];

function AdminPanel() {
    const toast = useToast();

    const handleSave = () => {
        toast({
            title: "Save",
            description: "Settings saved successfully.",
            status: "success",
            duration: 5000,
            isClosable: true,
        });
    };

    return (
        <ChakraProvider>
            <Container centerContent>
                <VStack spacing={4}>
                    <Heading as="h1" size="xl">Admin Panel</Heading>
                    <FormControl>
                        <FormLabel>Website Name</FormLabel>
                        <Input placeholder="Enter website name" />
                    </FormControl>
                    <Button onClick={handleSave} colorScheme="blue">Save</Button>
                </VStack>
            </Container>
        </ChakraProvider>
    );
}

// Render the admin panel
const rootElement = document.getElementById('admin');
ReactDOM.render(<AdminPanel />, rootElement);
