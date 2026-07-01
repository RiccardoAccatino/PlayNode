package com.playnode.auth_service;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Disabled("Context load richiede PostgreSQL (enum nativi); usare test unitari Mockito")
class AuthServiceApplicationTests {

	@Test
	void contextLoads() {
	}

}
