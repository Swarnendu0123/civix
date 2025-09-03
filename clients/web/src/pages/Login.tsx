import React from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  useColorModeValue,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useQuery } from 'react-query';
import { useAuth } from '@/context/AuthContext';

interface LoginForm {
  email: string;
  password: string;
}

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Required'),
  password: Yup.string().required('Required'),
});

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');

  const handleSubmit = async (values: LoginForm) => {
    try {
      await login(values.email, values.password);
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid credentials',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
      <Box w="400px" p={8} borderWidth={1} borderRadius={8} boxShadow="lg" bg={bgColor}>
        <VStack spacing={4}>
          <Heading>CIVIX</Heading>
          <Text color="gray.500">Municipal Complaint Management</Text>
          
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form style={{ width: '100%' }}>
                <VStack spacing={4}>
                  <Field name="email">
                    {({ field, form }: any) => (
                      <FormControl isInvalid={form.errors.email && form.touched.email}>
                        <FormLabel>Email</FormLabel>
                        <Input {...field} type="email" placeholder="Enter your email" />
                      </FormControl>
                    )}
                  </Field>
                  
                  <Field name="password">
                    {({ field, form }: any) => (
                      <FormControl isInvalid={form.errors.password && form.touched.password}>
                        <FormLabel>Password</FormLabel>
                        <InputGroup>
                          <InputRightElement>
                            <IconButton
                              aria-label="Toggle password visibility"
                              variant="link"
                              icon={field.showPassword ? <FiEyeOff /> : <FiEye />}
                              onClick={() => field.setValue('showPassword', !field.value.showPassword)}
                            />
                          </InputRightElement>
                          <Input
                            {...field}
                            type={field.value.showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                          />
                        </InputGroup>
                        <FormErrorMessage>{form.errors.password}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                  <Button
                    type="submit"
                    colorScheme="blue"
                    width="full"
                    isLoading={isSubmitting}
                  >
                    Sign In
                  </Button>
                </VStack>
              </Form>
            )}
          </Formik>
        </VStack>
      </Box>
    </Box>
  );
};

export default Login;
