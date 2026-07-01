package com.playnode.tournament_service;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Disabled("Context load richiede PostgreSQL (enum nativi); usare test unitari Mockito")
class TournamentServiceApplicationTests {

	@Test
	void contextLoads() {
	}

}
